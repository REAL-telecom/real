import { useTheme as useNavigationTheme } from '@react-navigation/native';

import { useDesignSystem } from './use-design-system';

export type ApplicationTheme = ReturnType<typeof useDesignSystem>;

export function useTheme(): ApplicationTheme {
  return useNavigationTheme() as ApplicationTheme;
}
