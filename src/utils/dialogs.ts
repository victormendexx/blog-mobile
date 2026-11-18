import { Alert } from 'react-native';

/** Aviso simples (ex.: erro ao excluir, sessão expirada). */
export function showAlert(title: string, message: string): void {
  Alert.alert(title, message);
}

/** Pede confirmação antes de uma exclusão. Resolve `true` só se o usuário confirmar. */
export function confirmDelete(itemDescription: string): Promise<boolean> {
  return new Promise((resolve) => {
    Alert.alert(
      'Confirmar exclusão',
      `Excluir ${itemDescription}? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
        { text: 'Excluir', style: 'destructive', onPress: () => resolve(true) },
      ],
      { cancelable: true, onDismiss: () => resolve(false) },
    );
  });
}
