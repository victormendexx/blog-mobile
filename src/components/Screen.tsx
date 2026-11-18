import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { colors, spacing } from '@/theme/tokens';

interface ScreenProps {
  children: ReactNode;
  /** Use `scroll` em telas de formulário/leitura; listas usam FlatList próprio. */
  scroll?: boolean;
}

/** Container padrão das telas: fundo do tema, espaçamento e teclado sem cobrir campos. */
export function Screen({ children, scroll = false }: ScreenProps) {
  if (!scroll) {
    return <View style={styles.container}>{children}</View>;
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  scrollContent: { padding: spacing.lg, gap: spacing.lg },
});
