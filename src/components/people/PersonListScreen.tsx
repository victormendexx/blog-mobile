import { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { router, type Href } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/Button';
import { Pagination } from '@/components/Pagination';
import { EmptyView, ErrorView, LoadingView } from '@/components/StateViews';
import { useAuth } from '@/context/AuthContext';
import { useAsyncData } from '@/hooks/useAsyncData';
import { getErrorMessage } from '@/services/api';
import type { PersonResource } from '@/services/peopleService';
import type { Person } from '@/types';
import { confirmDelete, showAlert } from '@/utils/dialogs';
import { colors, fontSize, radius, spacing } from '@/theme/tokens';
import { peopleConfig } from './peopleConfig';

const PAGE_SIZE = 10;

/** Listagem paginada de professores ou alunos, com editar e excluir. */
export function PersonListScreen({ resource }: { resource: PersonResource }) {
  const config = peopleConfig[resource];
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loader = useCallback(() => config.service.list(page, PAGE_SIZE), [config, page]);
  const { data, isLoading, error, reload } = useAsyncData(loader);

  async function handleDelete(person: Person) {
    if (!(await confirmDelete(`o ${config.singular} "${person.name}"`))) return;

    setDeletingId(person._id);
    try {
      await config.service.remove(person._id);

      // Excluiu o único item da página: volta uma página (a troca de página já recarrega)
      if (data?.items.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        await reload();
      }
    } catch (err) {
      showAlert('Não foi possível excluir', getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  }

  if (isLoading && !data) return <LoadingView message={`Carregando ${config.plural}...`} />;
  if (error && !data) return <ErrorView message={error} onRetry={reload} />;

  return (
    <Screen>
      <Button
        label={`Cadastrar ${config.singular}`}
        onPress={() => router.push(`${config.basePath}/new` as Href)}
      />
      {data ? (
        <Text style={styles.total}>
          {data.total} {data.total === 1 ? config.singular : config.plural} cadastrado(s)
        </Text>
      ) : null}
      <FlatList
        data={data?.items ?? []}
        keyExtractor={(person) => person._id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={<EmptyView message={`Nenhum ${config.singular} cadastrado.`} />}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={reload} tintColor={colors.primary} />
        }
        renderItem={({ item }) => {
          // Um professor não pode excluir a própria conta enquanto está logado com ela
          const isSelf = resource === 'teachers' && item._id === user?.id;

          return (
            <View style={styles.item}>
              <View style={styles.info}>
                <Text style={styles.name}>
                  {item.name}
                  {isSelf ? ' (você)' : ''}
                </Text>
                <Text style={styles.email}>{item.email}</Text>
              </View>
              <View style={styles.actions}>
                <Button
                  label="Editar"
                  variant="secondary"
                  compact
                  accessibilityLabel={`Editar ${config.singular} ${item.name}`}
                  onPress={() => router.push(`${config.basePath}/${item._id}` as Href)}
                />
                {!isSelf ? (
                  <Button
                    label="Excluir"
                    variant="danger"
                    compact
                    loading={deletingId === item._id}
                    accessibilityLabel={`Excluir ${config.singular} ${item.name}`}
                    onPress={() => handleDelete(item)}
                  />
                ) : null}
              </View>
            </View>
          );
        }}
      />
      {data ? (
        <Pagination
          page={data.page}
          totalPages={data.totalPages}
          onChange={setPage}
          disabled={isLoading}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  total: { fontSize: fontSize.sm, color: colors.textMuted, marginVertical: spacing.md },
  listContent: { paddingBottom: spacing.lg, flexGrow: 1 },
  separator: { height: spacing.sm },
  item: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  info: { gap: 2 },
  name: { fontSize: fontSize.md, fontWeight: '600', color: colors.text },
  email: { fontSize: fontSize.sm, color: colors.textMuted },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm },
});
