import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { HeaderAuthButton } from '@/components/HeaderAuthButton';
import { LoadingView } from '@/components/StateViews';
import { colors, fonts } from '@/theme/tokens';

function RootNavigator() {
  const { isAuthenticated, isTeacher, isLoading } = useAuth();

  // Espera restaurar a sessão salva antes de decidir quais rotas estão liberadas
  if (isLoading) {
    return <LoadingView message="Abrindo o Mural..." />;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.primary,
        headerTitleStyle: { color: colors.text, fontFamily: fonts.display },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
        headerBackButtonDisplayMode: 'minimal',
      }}
    >
      {/* Login: única tela acessível sem sessão */}
      <Stack.Protected guard={!isAuthenticated} redirectTo="/">
        <Stack.Screen name="login" options={{ title: 'Entrar' }} />
      </Stack.Protected>

      {/* Leitura: qualquer usuário logado (professor ou aluno) */}
      <Stack.Protected guard={isAuthenticated} redirectTo="/login">
        <Stack.Screen
          name="index"
          options={{ title: 'Mural', headerRight: () => <HeaderAuthButton /> }}
        />
        <Stack.Screen name="posts/[id]" options={{ title: 'Post' }} />
      </Stack.Protected>

      {/* Administração: só professores. Aluno (ou visitante) é mandado para a home */}
      <Stack.Protected guard={isTeacher} redirectTo="/">
        <Stack.Screen name="admin/index" options={{ title: 'Administração' }} />
        <Stack.Screen name="admin/posts/index" options={{ title: 'Gerenciar posts' }} />
        <Stack.Screen name="admin/posts/new" options={{ title: 'Novo post' }} />
        <Stack.Screen name="admin/posts/[id]" options={{ title: 'Editar post' }} />
        <Stack.Screen name="admin/teachers/index" options={{ title: 'Professores' }} />
        <Stack.Screen name="admin/teachers/new" options={{ title: 'Novo professor' }} />
        <Stack.Screen name="admin/teachers/[id]" options={{ title: 'Editar professor' }} />
        <Stack.Screen name="admin/students/index" options={{ title: 'Alunos' }} />
        <Stack.Screen name="admin/students/new" options={{ title: 'Novo aluno' }} />
        <Stack.Screen name="admin/students/[id]" options={{ title: 'Editar aluno' }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <RootNavigator />
    </AuthProvider>
  );
}
