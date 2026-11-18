import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { Button } from '@/components/Button';
import { useAuth } from '@/context/AuthContext';
import { getErrorMessage } from '@/services/api';
import { colors, fontSize, fonts } from '@/theme/tokens';

const loginSchema = z.object({
  email: z.string().trim().email('Informe um email válido'),
  password: z.string().min(1, 'Informe a senha'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const { login } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  // Depois do login, o Stack.Protected do layout troca esta tela pela home automaticamente
  async function onSubmit(values: LoginForm) {
    setSubmitError(null);
    try {
      await login(values.email, values.password);
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    }
  }

  return (
    <Screen scroll>
      <Text style={styles.title}>Bem-vindo ao Mural</Text>
      <Text style={styles.subtitle}>
        Entre com sua conta de professor ou aluno. Professores também podem criar e gerenciar posts,
        professores e alunos.
      </Text>

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Email"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.email?.message}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            textContentType="emailAddress"
          />
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Senha"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.password?.message}
            secureTextEntry
            autoComplete="password"
            textContentType="password"
            onSubmitEditing={() => handleSubmit(onSubmit)()}
          />
        )}
      />

      {submitError ? (
        <Text style={styles.error} accessibilityRole="alert">
          {submitError}
        </Text>
      ) : null}

      <Button label="Entrar" onPress={handleSubmit(onSubmit)} loading={isSubmitting} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fonts.display, fontSize: fontSize.xxl, color: colors.text },
  subtitle: { fontSize: fontSize.md, color: colors.textMuted, lineHeight: 22 },
  error: { color: colors.danger, fontSize: fontSize.md },
});
