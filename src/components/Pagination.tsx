import { StyleSheet, Text, View } from 'react-native';
import { Button } from './Button';
import { colors, fontSize, spacing } from '@/theme/tokens';

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  disabled?: boolean;
}

export function Pagination({ page, totalPages, onChange, disabled = false }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <View style={styles.row}>
      <Button
        label="Anterior"
        variant="secondary"
        compact
        disabled={disabled || page <= 1}
        accessibilityLabel="Página anterior"
        onPress={() => onChange(page - 1)}
      />
      <Text style={styles.label} accessibilityLiveRegion="polite">
        Página {page} de {totalPages}
      </Text>
      <Button
        label="Próxima"
        variant="secondary"
        compact
        disabled={disabled || page >= totalPages}
        accessibilityLabel="Próxima página"
        onPress={() => onChange(page + 1)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
  },
  label: { fontSize: fontSize.md, color: colors.textMuted },
});
