/**
 * Versão web do armazenamento: o expo-secure-store não tem implementação no navegador,
 * então usamos localStorage (mesma abordagem do front-end web da Fase 3).
 */
export const storage = {
  getItem: async (key: string): Promise<string | null> => localStorage.getItem(key),
  setItem: async (key: string, value: string): Promise<void> => localStorage.setItem(key, value),
  removeItem: async (key: string): Promise<void> => localStorage.removeItem(key),
};
