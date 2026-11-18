import { Pressable, StyleSheet, Text } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { colors, fontSize, minTouchSize, spacing } from '@/theme/tokens';

/**
 * Botão do cabeçalho da home: professores veem "Admin" (área administrativa);
 * alunos veem "Sair", já que não têm área administrativa.
 */
export function HeaderAuthButton() {
  const { isTeacher, logout } = useAuth();

  return (
    <Pressable
      onPress={() => (isTeacher ? router.push('/admin') : logout())}
      accessibilityRole="button"
      accessibilityLabel={isTeacher ? 'Abrir área administrativa' : 'Sair da conta'}
      hitSlop={8}
      style={styles.button}
    >
      <Text style={styles.label}>{isTeacher ? 'Admin' : 'Sair'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { minHeight: minTouchSize, justifyContent: 'center', paddingHorizontal: spacing.sm },
  label: { color: colors.primary, fontSize: fontSize.md, fontWeight: '600' },
});
