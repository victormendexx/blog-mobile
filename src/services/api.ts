import { create, type AxiosError, type AxiosRequestConfig } from 'axios';

/**
 * Aceita a URL com ou sem `http://` (ex.: "192.168.0.10:3000" ou "//localhost:3000")
 * e remove a barra final.
 */
function normalizeBaseUrl(raw: string | undefined): string {
  const url = (raw || 'http://10.0.2.2:3000').trim().replace(/\/+$/, '');
  return /^https?:\/\//i.test(url) ? url : `http://${url.replace(/^\/+/, '')}`;
}

export const API_URL = normalizeBaseUrl(process.env.EXPO_PUBLIC_API_URL);

interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/** Erro padronizado de API: mensagem amigável + status HTTP (0 = sem resposta / rede). */
export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// O token fica em memória para o interceptor (o SecureStore é assíncrono).
// O AuthContext mantém este valor sincronizado com o que está salvo no aparelho.
let authToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

export function setAuthToken(token: string | null): void {
  authToken = token;
}

/** Registra o que fazer quando a API responde 401 com uma sessão ativa (ex.: token expirado). */
export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler;
}

const client = create({
  baseURL: API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiEnvelope<unknown>>) => {
    if (!error.response) {
      return Promise.reject(
        new ApiError('Não foi possível conectar à API. Verifique sua conexão e a URL.', 0),
      );
    }

    const { status, data } = error.response;

    if (status === 401 && authToken) {
      onUnauthorized?.();
      return Promise.reject(new ApiError('Sua sessão expirou. Entre novamente.', 401));
    }

    if (status === 403) {
      return Promise.reject(new ApiError('Você não tem permissão para esta ação.', 403));
    }

    return Promise.reject(new ApiError(data?.error || 'Erro inesperado na API', status));
  },
);

/**
 * Faz a requisição e desembrulha o envelope {success, data} do back-end.
 * Nenhuma tela usa o axios diretamente: tudo passa por aqui.
 */
export async function apiRequest<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await client.request<ApiEnvelope<T>>(config);
  const body = response.data;

  // Resposta sem o envelope da API (ex.: HTML): a URL aponta para outro servidor
  if (typeof body !== 'object' || body === null || !('success' in body)) {
    throw new ApiError(
      `Resposta inválida de ${API_URL}. Confira EXPO_PUBLIC_API_URL no .env (inclua a porta).`,
      response.status,
    );
  }

  if (!body.success) {
    throw new ApiError(body.error || 'Erro inesperado na API', response.status);
  }

  return body.data as T;
}

/** Extrai uma mensagem legível de qualquer erro (ApiError ou inesperado). */
export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Erro inesperado';
}
