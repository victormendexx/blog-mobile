import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Screen } from './Screen';
import { TextField } from './TextField';
import { Button } from './Button';
import { FormError } from './FormMessage';
import { getErrorMessage } from '@/services/api';
import type { PostInput } from '@/types';

// Mesmas regras do createPostSchema do back-end
const postSchema = z.object({
  title: z.string().trim().min(1, 'O título é obrigatório'),
  content: z.string().trim().min(1, 'O conteúdo é obrigatório'),
  author: z.string().trim().min(1, 'O autor é obrigatório'),
});

interface PostFormProps {
  initialValues: PostInput;
  submitLabel: string;
  onSubmit: (values: PostInput) => Promise<void>;
}

/** Formulário compartilhado pelas telas de criação e edição de post. */
export function PostForm({ initialValues, submitLabel, onSubmit }: PostFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PostInput>({ resolver: zodResolver(postSchema), defaultValues: initialValues });

  async function submit(values: PostInput) {
    setSubmitError(null);
    try {
      await onSubmit(values);
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    }
  }

  return (
    <Screen scroll>
      <Controller
        control={control}
        name="title"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Título"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.title?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="author"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Autor"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.author?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="content"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Conteúdo"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.content?.message}
            multiline
          />
        )}
      />
      <FormError message={submitError} />
      <Button label={submitLabel} onPress={handleSubmit(submit)} loading={isSubmitting} />
    </Screen>
  );
}
