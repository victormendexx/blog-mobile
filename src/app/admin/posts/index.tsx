import { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/Button';
import { PostCard } from '@/components/PostCard';
import { EmptyView, ErrorView, LoadingView } from '@/components/StateViews';
import { useAsyncData } from '@/hooks/useAsyncData';
import { getErrorMessage } from '@/services/api';
import * as postsService from '@/services/postsService';
import type { Post } from '@/types';
import { confirmDelete, showAlert } from '@/utils/dialogs';
import { colors, spacing } from '@/theme/tokens';

/** Página administrativa: todos os posts, com editar e excluir. */
export default function AdminPostsScreen() {
  const { data: posts, isLoading, error, reload } = useAsyncData(postsService.listPosts);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = useCallback(
    async (post: Post) => {
      if (!(await confirmDelete(`o post "${post.title}"`))) return;

      setDeletingId(post._id);
      try {
        await postsService.deletePost(post._id);
        await reload();
      } catch (err) {
        showAlert('Não foi possível excluir', getErrorMessage(err));
      } finally {
        setDeletingId(null);
      }
    },
    [reload],
  );

  if (isLoading && !posts) return <LoadingView message="Carregando posts..." />;
  if (error && !posts) return <ErrorView message={error} onRetry={reload} />;

  return (
    <Screen>
      <Button label="Novo post" onPress={() => router.push('/admin/posts/new')} />
      <FlatList
        style={styles.list}
        data={posts ?? []}
        keyExtractor={(post) => post._id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={<EmptyView message="Nenhum post cadastrado." />}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={reload} tintColor={colors.primary} />
        }
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onPress={() => router.push(`/posts/${item._id}`)}
            actions={
              <>
                <Button
                  label="Editar"
                  variant="secondary"
                  compact
                  accessibilityLabel={`Editar post ${item.title}`}
                  onPress={() => router.push(`/admin/posts/${item._id}`)}
                />
                <Button
                  label="Excluir"
                  variant="danger"
                  compact
                  loading={deletingId === item._id}
                  accessibilityLabel={`Excluir post ${item.title}`}
                  onPress={() => handleDelete(item)}
                />
              </>
            }
          />
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { marginTop: spacing.lg },
  listContent: { paddingBottom: spacing.xxl, flexGrow: 1 },
  separator: { height: spacing.md },
});
