import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import type { Post } from '@/types';
import { formatDate, truncate } from '@/utils/text';
import { colors, fontSize, fonts, radius, spacing } from '@/theme/tokens';

interface PostCardProps {
  post: Post;
  onPress?: () => void;
  /** Ações extras exibidas no rodapé do card (ex.: editar/excluir na administração). */
  actions?: ReactNode;
}

/** Card de post: título, autor, data e um resumo do conteúdo. */
export function PostCard({ post, onPress, actions }: PostCardProps) {
  const body = (
    <>
      <Text style={styles.title}>{post.title}</Text>
      <Text style={styles.meta}>
        {post.author} · {formatDate(post.createdAt)}
      </Text>
      <Text style={styles.excerpt}>{truncate(post.content)}</Text>
    </>
  );

  return (
    <View style={styles.card}>
      {onPress ? (
        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={`Ler post ${post.title}, de ${post.author}`}
          style={({ pressed }) => [styles.body, pressed && styles.pressed]}
        >
          {body}
        </Pressable>
      ) : (
        <View style={styles.body}>{body}</View>
      )}
      {actions ? <View style={styles.actions}>{actions}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  body: { padding: spacing.lg, gap: spacing.xs },
  pressed: { backgroundColor: colors.surface },
  title: { fontFamily: fonts.display, fontSize: fontSize.lg, color: colors.text },
  meta: { fontSize: fontSize.sm, color: colors.textMuted },
  excerpt: { fontSize: fontSize.md, color: colors.text, lineHeight: 21, marginTop: spacing.xs },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
});
