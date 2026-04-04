import { Platform } from 'react-native';

const scale = {
  none: 0,
  half: 2,
  one: 4,
  two: 8,
  three: 12,
  four: 16,
  five: 20,
  six: 24,
  seven: 28,
  eight: 32,
  nine: 36,
  ten: 40,
  eleven: 44,
  twelve: 48,
  thirteen: 52,
  fourteen: 56,
  fifteen: 60,
  sixteen: 64,
  seventeen: 68,
  eighteen: 72,
  nineteen: 76,
  twenty: 80,
} as const;

export const BorderRadiuses = {
  ...scale,
} as const;

export type ThemeBorderRadiuses = keyof typeof BorderRadiuses;

export const BorderWidths = {
  thin: 1,
  medium: 2,
  thick: 3,
} as const;

export type ThemeBorderWidths = keyof typeof BorderWidths;

const palette = {
  black: '#000',
  brandBlack: '#2b2a29',
  white: '#fff',
  brandWhite: '#f9f9f9',
  gray: '#bbbec9',
  lightGray: '#ddd',
  brandBlue: '#1f7cc0',
  brandRed: '#d82226',
  green: '#008000',
  yellow: '#ffff00',
} as const;

const lightScheme = {
  background: palette.brandWhite,
  backgroundInverted: palette.brandBlack,
  border: palette.lightGray,
  card: palette.white,
  link: palette.brandBlue,
  notification: palette.brandRed,
  primary: palette.brandBlue,
  shadow: palette.brandBlack,
  surface: palette.lightGray,
  success: palette.green,
  warning: palette.yellow,
  text: palette.brandBlack,
  textInverted: palette.white,
  fieldsetBorder: palette.gray,
} as const;

const darkScheme = {
  background: palette.white,
  backgroundInverted: palette.brandWhite,
  border: palette.black,
  card: palette.brandBlack,
  link: palette.brandBlue,
  notification: palette.brandRed,
  primary: palette.brandBlue,
  shadow: palette.gray,
  surface: palette.lightGray,
  success: palette.green,
  warning: palette.yellow,
  text: palette.white,
  textInverted: palette.brandBlack,
  fieldsetBorder: palette.gray,
} as const;

export const Colors = {
  light: lightScheme,
  dark: darkScheme,
} as const;

export type ThemeColors = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Gaps = {
  ...scale,
} as const;

export type ThemeGaps = keyof typeof Gaps;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
});

export const FontSizes = {
  ...scale,
} as const;

export type ThemeFontSizes = keyof typeof FontSizes;

export const FontWeights = {
  thin: 100,
  extraLight: 200,
  light: 300,
  regular: 400,
  medium: 500,
  semiBold: 600,
  bold: 700,
  extraBold: 800,
} as const;

export type ThemeFontWeights = keyof typeof FontWeights;

export const LineHeights = {
  ...scale,
} as const;

export type ThemeLineHeights = keyof typeof LineHeights;

export const Margins = {
  ...scale,
} as const;

export type ThemeMargins = keyof typeof Margins;

export const Paddings = {
  ...scale,
} as const;

export type ThemePaddings = keyof typeof Paddings;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
