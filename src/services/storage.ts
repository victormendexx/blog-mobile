import * as SecureStore from 'expo-secure-store';

/**
 * Armazenamento da sessão no aparelho (Keychain no iOS, Keystore no Android).
 * Na web o Metro usa `storage.web.ts`, porque o SecureStore não existe no navegador.
 */
export const storage = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};
