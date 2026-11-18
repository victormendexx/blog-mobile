import { useCallback, useState } from 'react';
import type { Href } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { Button } from '@/components/Button';
import { FormError } from '@/components/FormMessage';
import { ErrorView, LoadingView } from '@/components/StateViews';
import { useAsyncData } from '@/hooks/useAsyncData';
import { getErrorMessage } from '@/services/api';
import type { PersonResource } from '@/services/peopleService';
import type { Person, PersonInput } from '@/types';
import { goBackOr } from '@/utils/navigation';
import { peopleConfig } from './peopleConfig';

interface FormValues {
  name: string;
  email: string;
  password: string;
}

const PASSWORD_MESSAGE = 'A senha deve ter ao menos 6 caracteres';

// Mesmas regras dos schemas Zod do back-end
function buildSchema(isEdit: boolean) {
  return z.object({
    name: z.string().trim().min(1, 'O nome é obrigatório'),
    email: z.string().trim().email('Informe um email válido'),
    password: isEdit
      ? z.string().refine((v) => v === '' || v.length >= 6, PASSWORD_MESSAGE)
      : z.string().min(6, PASSWORD_MESSAGE),
  });
}

interface PersonFormProps {
  resource: PersonResource;
  person?: Person;
}

function PersonForm({ resource, person }: PersonFormProps) {
  const config = peopleConfig[resource];
  const isEdit = !!person;
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(buildSchema(isEdit)),
    defaultValues: { name: person?.name ?? '', email: person?.email ?? '', password: '' },
  });

  async function submit(values: FormValues) {
    setSubmitError(null);
    const payload: PersonInput = { name: values.name, email: values.email };

    // Na edição, senha em branco = manter a atual
    if (values.password) {
      payload.password = values.password;
    }

    try {
      if (person) {
        await config.service.update(person._id, payload);
      } else {
        await config.service.create(payload);
      }
      goBackOr(config.basePath as Href);
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    }
  }

  return (
    <Screen scroll>
      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Nome"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.name?.message}
            autoComplete="name"
          />
        )}
      />
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
            keyboardType="email-address"
            autoComplete="email"
          />
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label={isEdit ? 'Nova senha' : 'Senha'}
            hint={isEdit ? 'Deixe em branco para manter a senha atual.' : 'Mínimo de 6 caracteres.'}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.password?.message}
            secureTextEntry
            autoComplete="new-password"
            textContentType="newPassword"
          />
        )}
      />
      <FormError message={submitError} />
      <Button
        label={isEdit ? 'Salvar alterações' : `Cadastrar ${config.singular}`}
        onPress={handleSubmit(submit)}
        loading={isSubmitting}
      />
    </Screen>
  );
}

/** Tela de cadastro de professor/aluno. */
export function PersonCreateScreen({ resource }: { resource: PersonResource }) {
  return <PersonForm resource={resource} />;
}

/** Tela de edição: carrega o registro atual antes de mostrar o formulário. */
export function PersonEditScreen({ resource, id }: { resource: PersonResource; id: string }) {
  const config = peopleConfig[resource];
  const loader = useCallback(() => config.service.get(id), [config, id]);
  const { data: person, isLoading, error, reload } = useAsyncData(loader);

  if (isLoading) return <LoadingView message={`Carregando ${config.singular}...`} />;
  if (error || !person) {
    return <ErrorView message={error ?? `${config.singular} não encontrado`} onRetry={reload} />;
  }

  return <PersonForm resource={resource} person={person} />;
}
