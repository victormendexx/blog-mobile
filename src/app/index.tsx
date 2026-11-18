import { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { PostCard } from '@/components/PostCard';
import { EmptyView, ErrorView, LoadingView } from '@/components/StateViews';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useAsyncData } from '@/hooks/useAsyncData';
import * as postsService from '@/services/postsService';
import { colors, spacing } from '@/theme/tokens';

/** Página principal: lista pública de posts com busca por palavra-chave. */
export default function PostListScreen() {
  const [search, setSearch] = useState('');
  const query = useDebouncedValue(search.trim());

  const loader = useCallback(
    () => (query ? postsService.searchPosts(query) : postsService.listPosts()),
    [query],
  );
  const { data: posts, isLoading, error, reload } = useAsyncData(loader);

  function renderContent() {
    if (isLoading && !posts) return <LoadingView message="Carregando posts..." />;
    if (error && !posts) return <ErrorView message={error} onRetry={reload} />;

    return (
      <FlatList
        data={posts ?? []}
        keyExtractor={(post) => post._id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => (
          <PostCard post={item} onPress={() => router.push(`/posts/${item._id}`)} />
        )}
        ListEmptyComponent={
          <EmptyView
            message={query ? `Nenhum post encontrado para "${query}".` : 'Nenhum post publicado.'}
          />
        }
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={reload} tintColor={colors.primary} />
        }
        keyboardShouldPersistTaps="handled"
      />
    );
  }

  return (
    <Screen>
      <TextField
        label="Buscar posts"
        placeholder="Digite uma palavra-chave"
        value={search}
        onChangeText={setSearch}
        returnKeyType="search"
        clearButtonMode="while-editing"
        autoCorrect={false}
      />
      <View style={styles.content}>{renderContent()}</View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, marginTop: spacing.lg },
  list: { paddingBottom: spacing.xxl, flexGrow: 1 },
  separator: { height: spacing.md },
});
