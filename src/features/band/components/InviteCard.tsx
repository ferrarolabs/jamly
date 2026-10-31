import { formatDistanceToNowStrict, isPast } from 'date-fns';
import { Share, StyleSheet, View } from 'react-native';

import { Button, Card, Text } from '@/components';
import { spacing } from '@/theme';
import type { Band, MemberRole } from '@/types/domain';
import { useRotateInvite } from '../hooks/useRotateInvite';
import { buildInviteMessage, buildInviteUrl } from '../inviteLink';

/**
 * Story A2: the invite link is presented immediately, never hidden in
 * settings — it is the most important control in the product (R2), and the
 * whole band's adoption runs through it.
 */
export function InviteCard({ band, role }: { band: Band; role: MemberRole }) {
  const rotate = useRotateInvite();
  const url = buildInviteUrl(band.inviteCode);

  const expiresAt = new Date(band.inviteExpiresAt);
  // Both this and the duration below read the clock, which is inherent to
  // "has it expired yet" — a card that flips to expired on a later render is
  // showing the truth, not a stale value.
  const hasExpired = isPast(expiresAt);

  const share = async () => {
    try {
      await Share.share({ message: buildInviteMessage(band.name, url) });
    } catch {
      // Dismissing the sheet is not a failure, and there is nothing useful to
      // say about one that genuinely fails — the link is on screen either way.
    }
  };

  return (
    <Card style={styles.root}>
      <Text variant="heading">Invite the band</Text>

      <Text tone="secondary">
        Send this to the rest of the band. Anyone who opens it joins {band.name}.
      </Text>

      <View style={styles.linkBox}>
        <Text variant="caption" tone="accent" selectable>
          {url}
        </Text>
      </View>

      {hasExpired ? (
        <Text variant="caption" tone="warning">
          This link has expired. Reset it to invite anyone else.
        </Text>
      ) : (
        <Text variant="caption" tone="muted">
          Works for the next {formatDistanceToNowStrict(expiresAt)}.
        </Text>
      )}

      <Button label="Share link" onPress={() => void share()} />

      {/* Rotation is the honest answer to a link that ended up in the wrong
          chat: the old one stops working the moment a new one is made. */}
      {role === 'leader' ? (
        <>
          <Button
            label={rotate.isSubmitting ? 'Resetting…' : 'Reset link'}
            variant="secondary"
            onPress={() => void rotate.submit(band.id)}
            disabled={rotate.isSubmitting}
          />
          <Text variant="caption" tone="muted">
            Resetting stops the old link working — use it if it went somewhere it shouldn&apos;t
            have.
          </Text>
        </>
      ) : null}

      {rotate.failure ? (
        <Text tone="danger" accessibilityLiveRegion="polite">
          {rotate.failure.message}
        </Text>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.sm,
  },
  linkBox: {
    marginTop: spacing.xs,
  },
});
