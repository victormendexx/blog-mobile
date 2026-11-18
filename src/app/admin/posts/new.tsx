import { router } from 'expo-router';
import { PostForm } from '@/components/PostForm';
import { useAuth } from '@/context/AuthContext';
import * as postsService from '@/services/postsService';
import type { PostInput } from '@/types';

/** Criação de post. O autor já vem preenchido com o professor logado. */
export default function PostCreateScreen() {
  const { user } = useAuth();

  async function handleSubmit(values: PostInput) {
    const post = await postsService.createPost(values);
    router.replace(`/posts/${post._id}`);
  }

  return (
    <PostForm
      initialValues={{ title: '', content: '', author: user?.name ?? '' }}
      submitLabel="Publicar"
      onSubmit={handleSubmit}
    />
  );
}
