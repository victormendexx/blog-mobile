/**
 * Tokens de design do app. Para trocar a identidade visual, altere apenas este arquivo:
 * todos os componentes leem cores, espaçamentos e tipografia daqui.
 * Paleta "Mural", a mesma do front-end web (Fase 3).
 */
import { Platform } from 'react-native';

export const colors = {
  background: '#FBF9F4', // fundo "papel"
  surface: '#F3EEE3',
  card: '#FFFFFF',
  border: '#DDD5C3',
  text: '#1F2421',
  textMuted: '#5C625E',
  primary: '#2E4A3D',
  primaryPressed: '#24392F',
  onPrimary: '#FFFFFF',
  highlight: '#E8B94E',
  danger: '#A63A2B',
  onDanger: '#FFFFFF',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 6,
  md: 10,
} as const;

export const fontSize = {
  sm: 13,
  md: 15,
  lg: 18,
  xl: 22,
  xxl: 28,
} as const;

export const fonts = {
  // Fontes do sistema: serifada nos títulos, sans no corpo (sem fontes customizadas)
  display: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
  body: Platform.select({ ios: 'System', android: 'sans-serif', default: 'sans-serif' }),
} as const;

/** Área mínima de toque recomendada para acessibilidade. */
export const minTouchSize = 44;
