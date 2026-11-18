import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { colors, fontSize, minTouchSize, radius, spacing } from '@/theme/tokens';

type Variant = 'primary' | 'secondary' | 'danger';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  /** Texto lido pelo leitor de tela, quando o rótulo visível não basta (ex.: "Excluir post X"). */
  accessibilityLabel?: string;
  compact?: boolean;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  accessibilityLabel,
  compact = false,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const palette = variants[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        compact && styles.compact,
        { backgroundColor: pressed ? palette.pressed : palette.background },
        palette.border && { borderWidth: 1, borderColor: palette.border },
        isDisabled && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.text} />
      ) : (
        <Text style={[styles.label, { color: palette.text }]}>{label}</Text>
      )}
    </Pressable>
  );
}

const variants: Record<
  Variant,
  { background: string; pressed: string; text: string; border?: string }
> = {
  primary: { background: colors.primary, pressed: colors.primaryPressed, text: colors.onPrimary },
  secondary: {
    background: colors.card,
    pressed: colors.surface,
    text: colors.primary,
    border: colors.border,
  },
  danger: { background: colors.danger, pressed: '#86301F', text: colors.onDanger },
};

const styles = StyleSheet.create({
  base: {
    minHeight: minTouchSize,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compact: { paddingHorizontal: spacing.md },
  label: { fontSize: fontSize.md, fontWeight: '600' },
  disabled: { opacity: 0.5 },
});
