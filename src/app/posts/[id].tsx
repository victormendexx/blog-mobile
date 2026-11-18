import { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Screen } from '@/components/Screen';
import { ErrorView, LoadingView } from '@/components/StateViews';
import { useAsyncData } from '@/hooks/useAsyncData';
import * as postsService from '@/services/postsService';
import { formatDate } from '@/utils/text';
import { colors, fontSize, fonts, spacing } from '@/theme/tokens';

/** Leitura do post completo (rota pública). */
export default function PostReadScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const loader = useCallback(() => postsService.getPost(id), [id]);
  const { data: post, isLoading, error, reload } = useAsyncData(loader);

  if (isLoading) return <LoadingView message="Carregando post..." />;
  if (error || !post)
    return <ErrorView message={error ?? 'Post não encontrado'} onRetry={reload} />;

  const wasEdited = post.updatedAt !== post.createdAt;

  return (
    <Screen scroll>
      <Stack.Screen options={{ title: post.title }} />
      <View style={styles.header}>
        <Text style={styles.title} accessibilityRole="header">
          {post.title}
        </Text>
        <Text style={styles.meta}>
          Por {post.author} · {formatDate(post.createdAt)}
          {wasEdited ? ` · atualizado em ${formatDate(post.updatedAt)}` : ''}
        </Text>
      </View>
      <Text style={styles.content} selectable>
        {post.content}
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderColor: colors.border,
    paddingBottom: spacing.lg,
  },
  title: { fontFamily: fonts.display, fontSize: fontSize.xxl, color: colors.text, lineHeight: 34 },
  meta: { fontSize: fontSize.sm, color: colors.textMuted },
  content: { fontSize: fontSize.md + 1, color: colors.text, lineHeight: 26 },
});
