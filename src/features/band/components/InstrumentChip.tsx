import { Pressable, StyleSheet } from 'react-native';

import { Text } from '@/components';
import { colors, radius, spacing, touchTarget } from '@/theme';

type InstrumentChipProps = {
  label: string;
  /** `selected` is in my list and removes on tap; `suggestion` adds on tap. */
  kind: 'selected' | 'suggestion';
  onPress: () => void;
  disabled?: boolean;
};

/**
 * One tappable instrument in the editor.
 *
 * The sign carries the meaning, not the colour: `×` removes, `+` adds. A stage
 * is full of coloured light (colors.ts). `accent` is not used — it means "now".
 */
export function InstrumentChip({
  label,
  kind,
  onPress,
  disabled = false,
}: InstrumentChipProps) {
  const selected = kind === 'selected';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={selected ? `Remove ${label}` : `Add ${label}`}
      accessibilityState={{ disabled }}
      onPress={onPress}
      disabled={disabled}
      hitSlop={spacing.xs}
      style={({ pressed }) => [
        styles.base,
        selected ? styles.selected : styles.suggestion,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Text variant="label" tone={selected ? 'primary' : 'secondary'}>
        {selected ? `${label}  ×` : `+ ${label}`}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: touchTarget - spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selected: {
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.textSecondary,
  },
  suggestion: {
    backgroundColor: 'transparent',
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.75,
  },
  disabled: {
    opacity: 0.4,
  },
});
