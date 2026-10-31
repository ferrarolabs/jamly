import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Button, Card, Screen, ScreenHeader, Text } from '@/components';
import { useJoinBand } from '@/features/band';
import { colors, spacing } from '@/theme';

/**
 * Story A3 — the screen a tapped invite link lands on.
 *
 * It redeems the code on arrival rather than asking for a confirming tap: the
 * musician already chose, by tapping the link, and the budget for this flow is
 * under 30 seconds and no more than four taps.
 *
 * Reachable only while signed in. With self-serve sign-up disabled (ADR-0008)
 * an account has to exist first anyway; carrying a pending code through the
 * sign-in screen belongs with the rest of A3, once accounts can be created
 * from an invite.
 */
export default function JoinScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const { submit, isSubmitting, result } = useJoinBand();
  const redeemed = useRef(false);

  useEffect(() => {
    // An effect because arriving *is* the trigger — there is nothing to derive
    // during render, and the guard makes sure a re-render never joins twice.
    if (redeemed.current || !code) return;
    redeemed.current = true;
    void submit(code);
  }, [code, submit]);

  if (isSubmitting || (!result && code)) {
    return (
      <Screen>
        <View style={styles.centred}>
          <ActivityIndicator color={colors.textSecondary} />
          <Text tone="secondary" style={styles.waiting}>
            Getting you in…
          </Text>
        </View>
      </Screen>
    );
  }

  if (result?.ok) {
    return (
      <Screen>
        <ScreenHeader
          title={result.bandName}
          subtitle={result.outcome === 'joined' ? "You're in." : 'You were already in.'}
        />
        <Button label="Go to the band" onPress={() => router.replace('/')} />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScreenHeader title="That didn't work" />

      <Card>
        <Text tone="secondary">
          {result && !result.ok && result.outcome === 'expired'
            ? 'That link has expired. Ask your band leader to send a new one.'
            : result && !result.ok && result.outcome === 'failed'
              ? result.failure.message
              : "That link doesn't match any band. Ask your band leader to send it again."}
        </Text>
      </Card>

      <Button
        label="Back"
        variant="secondary"
        onPress={() => router.replace('/')}
        style={styles.back}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  centred: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waiting: {
    marginTop: spacing.md,
  },
  back: {
    marginTop: spacing.lg,
  },
});
