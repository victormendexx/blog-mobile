import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { getErrorMessage } from '@/services/api';

interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

/**
 * Executa `loader` e expõe data/loading/erro. Carrega quando a tela ganha foco (inclusive ao
 * voltar de uma tela de criar/editar) e sempre que `loader` mudar (use useCallback com as
 * dependências corretas). Respostas antigas são descartadas para evitar condição de corrida
 * (ex.: busca digitada rápido).
 */
export function useAsyncData<T>(loader: () => Promise<T>): AsyncState<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const reload = useCallback(async () => {
    const id = ++requestId.current;
    setIsLoading(true);
    setError(null);

    try {
      const result = await loader();
      if (id === requestId.current) setData(result);
    } catch (err) {
      if (id === requestId.current) setError(getErrorMessage(err));
    } finally {
      if (id === requestId.current) setIsLoading(false);
    }
  }, [loader]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  return { data, isLoading, error, reload };
}
