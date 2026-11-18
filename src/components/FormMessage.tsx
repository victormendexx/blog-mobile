import { StyleSheet, Text } from 'react-native';
import { colors, fontSize } from '@/theme/tokens';

/** Erro de envio do formulário (ex.: resposta 400/409 da API). */
export function FormError({ message }: { message: string | null }) {
  if (!message) return null;

  return (
    <Text style={styles.error} accessibilityRole="alert" accessibilityLiveRegion="polite">
      {message}
    </Text>
  );
}

const styles = StyleSheet.create({
  error: { color: colors.danger, fontSize: fontSize.md },
});
