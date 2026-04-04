import { Platform, StyleSheet, Text, type TextProps } from 'react-native';

import { useTheme } from '@hooks/use-theme';
import { Fonts, type ThemeColors } from '@theme';

export type ThemedTextProps = TextProps & {
  type?:
    | 'code'
    | 'default'
    | 'defaultBold'
    | 'link'
    | 'linkBold'
    | 'medium'
    | 'mediumBold'
    | 'small'
    | 'smallBold' 
    | 'subtitle'
    | 'title';
  themeColor?: ThemeColors;
};

export function ThemedText({
  style,
  type = 'default',
  themeColor,
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
    link: {
      fontSize: theme.fontSizes.four,
      fontWeight: theme.fontWeights.medium,
      lineHeight: theme.lineHeights.six,
    },
    linkBold: {
      fontSize: theme.fontSizes.four,
      fontWeight: theme.fontWeights.bold,
      lineHeight: theme.lineHeights.six,
    },
    code: {
      fontFamily: Fonts.mono,
      fontSize: theme.fontSizes.four,
      fontWeight:
        Platform.select({ android: theme.fontWeights.bold }) ?? theme.fontWeights.medium,
      lineHeight: theme.lineHeights.six,
    },
  });

  return (
    <Text
      style={[
        {
          color:
            theme.colors[
              type === 'link' || type === 'linkBold' ? 'link' : 'text'
            ],
        },
        type === 'code' && styles.code,
        type === 'default' && styles.default,
        type === 'defaultBold' && styles.defaultBold,
        type === 'link' && styles.link,
        type === 'linkBold' && styles.linkBold,
        type === 'small' && styles.small,
        type === 'smallBold' && styles.smallBold,
        type === 'subtitle' && styles.subtitle,
        type === 'title' && styles.title,
        style,
      ]}
      {...rest}
    />
  );
}
