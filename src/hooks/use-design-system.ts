import { useColorScheme } from 'react-native';

import {
  BorderRadiuses,
  BorderWidths,
  Colors,
  Fonts,
  FontSizes,
  FontWeights,
  Gaps,
  LineHeights,
  Margins,
  Paddings,
} from '@theme';

export function useDesignSystem() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';

  return {
    dark: scheme === 'dark',
    colors: Colors[scheme],
    gaps: Gaps,
    borderRadiuses: BorderRadiuses,
    borderWidths: BorderWidths,
    fonts: {
      regular: {
        fontFamily: Fonts.sans,
        fontWeight: String(FontWeights.regular) as '400',
      },
      medium: {
        fontFamily: Fonts.sans,
        fontWeight: String(FontWeights.medium) as '500',
      },
      bold: {
        fontFamily: Fonts.sans,
        fontWeight: String(FontWeights.bold) as '700',
      },
      heavy: {
        fontFamily: Fonts.sans,
        fontWeight: String(FontWeights.extraBold) as '800',
      },
    },
    fontSizes: FontSizes,
    fontWeights: FontWeights,
    lineHeights: LineHeights,
    margins: Margins,
    paddings: Paddings,
  };
}
