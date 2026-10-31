import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button, Field, Text } from '@/components';
import { spacing } from '@/theme';
import { hasInstrument, INSTRUMENT_SUGGESTIONS, normaliseInstruments } from '../instruments';
import type { BandFailure } from '../types';
import { InstrumentChip } from './InstrumentChip';

type InstrumentsEditorProps = {
  /** What the roster shows now. Never changed by this component. */
  initial: readonly string[];
  /** Resolves true once saved. On false the editor stays open, with the draft. */
  onSave: (instruments: string[]) => Promise<boolean>;
  onCancel: () => void;
  isSaving: boolean;
  failure: BandFailure | null;
};

/**
 * Story A4: my instruments in this band.
 *
 * An empty list is valid, and nothing here asks for one to be filled in (no
 * "complete your profile" prompts). Saving with nothing selected is allowed.
 */
export function InstrumentsEditor({
  initial,
  onSave,
  onCancel,
  isSaving,
  failure,
}: InstrumentsEditorProps) {
  const [draft, setDraft] = useState<string[]>(() => normaliseInstruments(initial));
  const [typed, setTyped] = useState('');

  const add = (instrument: string) =>
    setDraft((was) => normaliseInstruments([...was, instrument]));
  const remove = (instrument: string) =>
    setDraft((was) => was.filter((item) => item !== instrument));

  const addTyped = () => {
    add(typed);
    setTyped('');
  };

  // Text left in the field counts: tapping Save straight after typing "sax"
  // and not pressing Add should not lose it.
  const save = async () => {
    const next = normaliseInstruments([...draft, typed]);
    const saved = await onSave(next);
    if (saved) setTyped('');
  };

  const suggestions = INSTRUMENT_SUGGESTIONS.filter((item) => !hasInstrument(draft, item));

  return (
    <View style={styles.root}>
      <Text variant="label" tone="secondary">
        What you play in this band
      </Text>

      {draft.length ? (
        <View style={styles.chips}>
          {draft.map((instrument) => (
            <InstrumentChip
              key={instrument}
              label={instrument}
              kind="selected"
              onPress={() => remove(instrument)}
              disabled={isSaving}
            />
          ))}
        </View>
      ) : (
        <Text variant="caption" tone="muted">
          Nothing yet.
        </Text>
      )}

      {suggestions.length ? (
        <View style={styles.chips}>
          {suggestions.map((instrument) => (
            <InstrumentChip
              key={instrument}
              label={instrument}
              kind="suggestion"
              onPress={() => add(instrument)}
              disabled={isSaving}
            />
          ))}
        </View>
      ) : null}

      <View style={styles.typedRow}>
        <View style={styles.typedField}>
          <Field
            label="Something else"
            value={typed}
            onChangeText={setTyped}
            onSubmitEditing={addTyped}
            placeholder="e.g. sax"
            autoCapitalize="none"
            returnKeyType="done"
            editable={!isSaving}
          />
        </View>
        <Button
          label="Add"
          variant="secondary"
          onPress={addTyped}
          disabled={isSaving || !typed.trim()}
        />
      </View>

      {failure ? (
        <Text tone="danger" accessibilityLiveRegion="polite">
          {failure.message}
        </Text>
      ) : null}

      <View style={styles.actions}>
        <Button
          label={isSaving ? 'Saving…' : 'Save'}
          onPress={() => void save()}
          disabled={isSaving}
          style={styles.action}
        />
        <Button
          label="Cancel"
          variant="ghost"
          onPress={onCancel}
          disabled={isSaving}
          style={styles.action}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.sm,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  typedRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  typedField: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  action: {
    flex: 1,
  },
});
