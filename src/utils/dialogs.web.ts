/**
 * Versão web dos diálogos: o Alert do React Native não faz nada no navegador
 * (react-native-web não implementa botões), então usamos os diálogos nativos do browser.
 */
export function showAlert(title: string, message: string): void {
  window.alert(`${title}\n\n${message}`);
}

export function confirmDelete(itemDescription: string): Promise<boolean> {
  return Promise.resolve(
    window.confirm(`Excluir ${itemDescription}? Esta ação não pode ser desfeita.`),
  );
}
