import { Platform, StyleSheet, Text, type TextProps } from 'react-native';

import { useTheme } from '@hooks';
import { Fonts, type ThemeColors } from '@theme';

export type ThemedTextProps = TextProps & {
  type?:
    | 'code'
    | 'default'
    | 'defaultBold'
    | 'medium'
    | 'mediumBold'
    | 'small'
    | 'smallBold'
    | 'subtitle'
    | 'title';
  color?: ThemeColors;
};

export function ThemedText({
  style,
  type = 'default',
  color = 'text',
  ...rest
}: ThemedTextProps) {
  const theme = useTheme();

  const styles = StyleSheet.create({
    small: {
      fontSize: theme.fontSizes.two,
      fontWeight: theme.fontWeights.regular,
      lineHeight: theme.lineHeights.four,
    },
    smallBold: {
      fontSize: theme.fontSizes.two,
      fontWeight: theme.fontWeights.regular,
      lineHeight: theme.lineHeights.four,
    },
    medium: {
      fontSize: theme.fontSizes.three,
      fontWeight: theme.fontWeights.medium,
      lineHeight: theme.lineHeights.five,
    },
    mediumBold: {
      fontSize: theme.fontSizes.three,
      fontWeight: theme.fontWeights.medium,
      lineHeight: theme.lineHeights.five,
    },
    default: {
      fontSize: theme.fontSizes.four,
      fontWeight: theme.fontWeights.medium,
      lineHeight: theme.lineHeights.six,
    },
    defaultBold: {
      fontSize: theme.fontSizes.four,
      fontWeight: theme.fontWeights.bold,
      lineHeight: theme.lineHeights.six,
    },
    subtitle: {
      fontSize: theme.fontSizes.six,
      fontWeight: theme.fontWeights.semiBold,
      lineHeight: theme.lineHeights.eight,
    },
    title: {
      fontSize: theme.fontSizes.eight,
      fontWeight: theme.fontWeights.semiBold,
      lineHeight: theme.lineHeights.ten,
    },
    code: {
      fontFamily: Fonts.mono,
      fontSize: theme.fontSizes.four,
      fontWeight:
        Platform.select({ android: theme.fontWeights.bold }) ?? theme.fontWeights.medium,
      lineHeight: theme.lineHeights.six,
    },
  });

  const getFontStyle = () => {
    switch (type) {
      case 'code':
        return styles.code;
      case 'default':
        return styles.default;
      case 'defaultBold':
        return styles.defaultBold;
      case 'medium':
        return styles.medium;
      case 'mediumBold':
        return styles.mediumBold;
      case 'small':
        return styles.small;
      case 'smallBold':
        return styles.smallBold;
      case 'subtitle':
        return styles.subtitle;
      case 'title':
        return styles.title;
      default:
        return styles.default;
    }
  };

  return (
    <Text style={[{ color: theme.colors[color] }, getFontStyle(), style]} {...rest} />
  );
}
