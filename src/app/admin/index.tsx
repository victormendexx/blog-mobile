import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/Button';
import { useAuth } from '@/context/AuthContext';
import { colors, fontSize, fonts, spacing } from '@/theme/tokens';

/** Menu da área do professor. */
export default function AdminHomeScreen() {
  const { user, logout } = useAuth();

  // Ao sair, o Stack.Protected do layout leva para a tela de login automaticamente
  async function handleLogout() {
    await logout();
  }

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text style={styles.greeting} accessibilityRole="header">
          Olá, {user?.name}
        </Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <View style={styles.menu}>
        <Button label="Novo post" onPress={() => router.push('/admin/posts/new')} />
        <Button
          label="Gerenciar posts"
          variant="secondary"
          onPress={() => router.push('/admin/posts')}
        />
        <Button
          label="Professores"
          variant="secondary"
          onPress={() => router.push('/admin/teachers')}
        />
        <Button label="Alunos" variant="secondary" onPress={() => router.push('/admin/students')} />
      </View>

      <Button label="Sair" variant="danger" onPress={handleLogout} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing.xs },
  greeting: { fontFamily: fonts.display, fontSize: fontSize.xl, color: colors.text },
  email: { fontSize: fontSize.md, color: colors.textMuted },
  menu: { gap: spacing.md, marginVertical: spacing.lg },
});
