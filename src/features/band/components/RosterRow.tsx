import { StyleSheet, View } from 'react-native';

import { Text } from '@/components';
import { spacing } from '@/theme';
import type { RosterMember } from '../types';

/** Name, then role and instruments — the way the band reads a roster. */
export function RosterRow({ member }: { member: RosterMember }) {
  return (
    <View style={styles.root}>
      <Text>{member.displayName ?? 'Name not set yet'}</Text>

      <Text variant="caption" tone="muted">
        {[
          member.role === 'leader' ? 'Leader' : null,
          member.instruments.length ? member.instruments.join(', ') : null,
        ]
          .filter(Boolean)
          .join(' · ') || 'Member'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    gap: spacing.xs,
  },
});
