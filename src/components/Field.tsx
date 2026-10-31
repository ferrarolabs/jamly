import { useState, type Ref } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { colors, radius, spacing, touchTarget, typography } from '@/theme';
import { Text } from './Text';

type FieldProps = TextInputProps & {
  label: string;
  /** What is wrong with what was typed. Shown under the field, in words. */
  error?: string | undefined;
  /** Renders the value as dots, with a control to reveal it. */
  secret?: boolean;
  inputRef?: Ref<TextInput>;
};

/**
 * A labelled text input.
 *
 * Started out feature-local to auth and moved here when band became the second
 * feature to need it — which is the rule, rather than moving things in
 * anticipation (docs/tech/33-conventions.md).
 */
export function Field({ label, error, secret = false, inputRef, style, ...rest }: FieldProps) {
  const [revealed, setRevealed] = useState(false);

  return (
    <View style={styles.root}>
      <Text variant="label" tone="secondary">
        {label}
      </Text>

      <View style={[styles.inputRow, Boolean(error) && styles.inputRowError]}>
        <TextInput
          ref={inputRef}
          style={[styles.input, style]}
          placeholderTextColor={colors.textMuted}
          selectionColor={colors.accent}
          // Autocorrect on a credential field turns a correct password into a
          // wrong one, and leaves it in the keyboard's learned-word dictionary.
          autoCorrect={false}
          spellCheck={false}
          secureTextEntry={secret && !revealed}
          accessibilityLabel={label}
          {...rest}
        />

        {secret ? (
          <Pressable
            onPress={() => setRevealed((was) => !was)}
            hitSlop={spacing.sm}
            accessibilityRole="button"
            // A typo in a password nobody can see is the most common reason a
            // correct password "does not work".
            accessibilityLabel={revealed ? 'Hide password' : 'Show password'}
            style={styles.reveal}
          >
            <Text variant="label" tone="accent">
              {revealed ? 'Hide' : 'Show'}
            </Text>
          </Pressable>
        ) : null}
      </View>

      {error ? (
        <Text variant="caption" tone="danger">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.xs,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    minHeight: touchTarget,
  },
  inputRowError: {
    borderColor: colors.danger,
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
    paddingVertical: spacing.sm,
  },
  reveal: {
    paddingLeft: spacing.sm,
  },
});
