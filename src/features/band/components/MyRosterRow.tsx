import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components';
import { spacing } from '@/theme';
import { useUpdateInstruments } from '../hooks/useUpdateInstruments';
import type { RosterMember } from '../types';
import { InstrumentsEditor } from './InstrumentsEditor';
import { RosterRow } from './RosterRow';

/**
 * My own row on the roster: the same row as everyone's, plus "Edit".
 *
 * Instruments are per band, so they are edited here, on this band's roster,
 * and not in a profile screen (decision log, story A4). The row above the
 * editor keeps showing the saved list, so a failed save visibly changes
 * nothing.
 */
export function MyRosterRow({ bandId, member }: { bandId: string; member: RosterMember }) {
  const [isEditing, setEditing] = useState(false);
  const update = useUpdateInstruments(bandId);

  const close = () => {
    update.reset();
    setEditing(false);
  };

  const save = async (instruments: string[]) => {
    const saved = await update.submit(instruments);
    if (saved) setEditing(false);
    return saved;
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <RosterRow member={member} />
        {isEditing ? null : (
          <Button label="Edit" variant="secondary" onPress={() => setEditing(true)} />
        )}
      </View>

      {isEditing ? (
        <InstrumentsEditor
          initial={member.instruments}
          onSave={save}
          onCancel={close}
          isSaving={update.isSubmitting}
          failure={update.failure}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});
