import { StyleSheet, View } from 'react-native';

import { useTheme } from '@hooks/use-theme';
import { ThemedText } from '@ui/themed-text'
import { ThemedView } from '../themed-view';

type FieldsetProps = {
  children: React.ReactNode;
  legend?: string;
};

export function Fieldset({ children, legend }: FieldsetProps) {
  const theme = useTheme();
  
  const styles = StyleSheet.create({
    fieldset: {
      width: '100%',
      borderWidth: theme.borderWidths.thin,
      borderColor: theme.colors.fieldsetBorder,
      borderRadius: theme.borderRadiuses.three,
      paddingTop: theme.paddings.six,
    },
    legendContainer: {
      position: 'absolute',
      top: -theme.margins.three,
      left: theme.margins.five,
      paddingHorizontal: legend ? theme.paddings.one : theme.paddings.none,
    },
  });

  return (
    <ThemedView style={styles.fieldset}>
      <ThemedView type='light' style={styles.legendContainer}>
        <ThemedText type='default'>{legend}</ThemedText>
      </ThemedView>
      {children}
    </ThemedView>
  );
};
