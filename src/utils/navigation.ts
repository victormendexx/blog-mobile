import { router, type Href } from 'expo-router';

/**
 * Volta para a tela anterior; se não houver (ex.: tela aberta por link direto ou após
 * recarregar a página na web), substitui pela rota de fallback.
 */
export function goBackOr(fallback: Href): void {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace(fallback);
  }
}
