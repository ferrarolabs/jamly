import { StyleSheet, View } from 'react-native';

import { Card, Text } from '@/components';
import { spacing } from '@/theme';
import type { RosterMember } from '../types';
import { MyRosterRow } from './MyRosterRow';
import { RosterRow } from './RosterRow';

/**
 * Who is in the band.
 *
 * Mapped rather than virtualised: the FlashList rule exists for the repertoire
 * and setlists, where a list is hundreds of rows. A band is five people inside
 * a screen that already scrolls, and nesting a virtualised list inside it
 * would break the scroll rather than help it.
 *
 * Seeing the whole roster is also the cheap half of the invite-link threat
 * model: in a band where everyone knows each other, somebody who was never
 * invited is obvious at a glance.
 */
export function Roster({
  bandId,
  members,
  myUserId,
  onEditingChange,
}: {
  bandId: string;
  members: RosterMember[];
  /** Only this member's row gets "Edit" (story A4). */
  myUserId: string | null;
  /** True while my instruments editor is open. */
  onEditingChange?: (isEditing: boolean) => void;
}) {
  return (
    <Card>
      <Text variant="heading">
        {members.length === 1 ? 'Just you so far' : `${members.length} in the band`}
      </Text>

      <View style={styles.list}>
        {members.map((member) =>
          member.userId === myUserId ? (
            <MyRosterRow
              key={member.userId}
              bandId={bandId}
              member={member}
              onEditingChange={onEditingChange}
            />
          ) : (
            <RosterRow key={member.userId} member={member} />
          ),
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  list: {
    marginTop: spacing.sm,
    gap: spacing.md,
  },
});
