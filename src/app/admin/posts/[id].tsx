import { useCallback } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { PostForm } from '@/components/PostForm';
import { ErrorView, LoadingView } from '@/components/StateViews';
import { useAsyncData } from '@/hooks/useAsyncData';
import * as postsService from '@/services/postsService';
import type { PostInput } from '@/types';
import { goBackOr } from '@/utils/navigation';

/** Edição de post: carrega os dados atuais e salva as alterações. */
export default function PostEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const loader = useCallback(() => postsService.getPost(id), [id]);
  const { data: post, isLoading, error, reload } = useAsyncData(loader);

  if (isLoading) return <LoadingView message="Carregando post..." />;
  if (error || !post)
    return <ErrorView message={error ?? 'Post não encontrado'} onRetry={reload} />;

  async function handleSubmit(values: PostInput) {
    await postsService.updatePost(id, values);
    goBackOr('/admin/posts');
  }

  return (
    <PostForm
      initialValues={{ title: post.title, content: post.content, author: post.author }}
      submitLabel="Salvar alterações"
      onSubmit={handleSubmit}
    />
  );
}
