import { StyleSheet,View, type ViewProps } from 'react-native';

import { useTheme } from '@hooks/use-theme';

export type ThemedViewProps = ViewProps & {
  type?: 'light' | 'dark' | 'transparent' | 'card';
};

export function ThemedView({ style, type, ...otherProps }: ThemedViewProps) {
  const theme = useTheme();

  const styles = StyleSheet.create({
    light: {
      // TODO: свой фон/отступы для «светлого» блока
      backgroundColor: theme.colors.background,
    },
    dark: {
      // TODO: свой фон для «тёмного» блока
      backgroundColor: theme.colors.backgroundInverted,
    },
    transparent: {
      backgroundColor: 'transparent',
    },
    card: {
      // TODO: карточка: радиус, тень, паддинги и т.д.
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadiuses?.three ?? 12,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 5,
    },
  });

  return <View style={[styles[type ?? 'transparent'], style]} {...otherProps} />;
}
