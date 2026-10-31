import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Button, Card, Screen, ScreenHeader, Text } from '@/components';
import { useAuth, useAuthUser } from '@/features/auth';
import { JoinByCodeForm, Roster, useBandRoster, useCurrentBand } from '@/features/band';
import { colors, spacing } from '@/theme';

/**
 * The band, and what to do if you haven't got one.
 *
 * This is `BandHome` in docs/design/21-information-architecture.md, arriving
 * with the only feature that exists so far. It will grow the next event at the
 * top of it — the zero-taps-to-value part (story C2) — when events are built.
 */
export default function BandHomeScreen() {
  const { membership, isPending, isError, refetch } = useCurrentBand();
  const roster = useBandRoster(membership?.band.id ?? null);
  const { signOut } = useAuth();
  const user = useAuthUser();
  // While I edit my instruments, Save is the only primary action on screen
  // (decision log D55). Hiding "Invite the band" also stops me leaving with an
  // unsaved draft.
  const [isEditingInstruments, setEditingInstruments] = useState(false);

  if (isPending) {
    return (
      <Screen>
        <View style={styles.centred}>
          <ActivityIndicator color={colors.textSecondary} />
        </View>
      </Screen>
    );
  }

  if (isError) {
    return (
      <Screen>
        <ScreenHeader title="Jamly" />
        <Card>
          <Text variant="heading">Couldn&apos;t load your bands</Text>
          <Text tone="secondary" style={styles.spaced}>
            You may be offline, or the database may not be migrated yet.
          </Text>
          <Button label="Try again" onPress={() => void refetch()} style={styles.spaced} />
        </Card>
        <SignOut onPress={() => void signOut()} />
      </Screen>
    );
  }

  if (!membership) {
    return (
      <Screen scroll>
        <ScreenHeader
          title="Jamly"
          subtitle="Start a band, or join one you've been invited to."
        />

        <Card>
          <Text variant="heading">Create your band</Text>
          <Text tone="secondary" style={styles.spaced}>
            It only needs a name. You&apos;ll get a link to share straight after.
          </Text>
          <Button
            label="Create a band"
            onPress={() => router.push('/band/create')}
            style={styles.spaced}
          />
        </Card>

        <Card style={styles.card}>
          <Text variant="heading">Got an invite?</Text>
          <Text tone="secondary" style={styles.spaced}>
            Tapping the link your band sent is the quick way. If that didn&apos;t work, paste it
            here.
          </Text>
          <View style={styles.spaced}>
            <JoinByCodeForm />
          </View>
        </Card>

        <SignOut onPress={() => void signOut()} />
      </Screen>
    );
  }

  const { band, role } = membership;

  return (
    <Screen scroll>
      <ScreenHeader
        title={band.name}
        subtitle={role === 'leader' ? 'You lead this band' : "You're in this band"}
      />

      {roster.isPending ? (
        <Card>
          <ActivityIndicator color={colors.textSecondary} />
        </Card>
      ) : roster.isError ? (
        <Card>
          <Text tone="secondary">Couldn&apos;t load who&apos;s in the band.</Text>
        </Card>
      ) : (
        <Roster
          bandId={band.id}
          members={roster.data ?? []}
          myUserId={user?.id ?? null}
          onEditingChange={setEditingInstruments}
        />
      )}

      {isEditingInstruments ? null : (
        <Button
          label="Invite the band"
          onPress={() => router.push('/band/invite')}
          style={styles.card}
        />
      )}

      <SignOut onPress={() => void signOut()} />
    </Screen>
  );
}

function SignOut({ onPress }: { onPress: () => void }) {
  return <Button label="Sign out" variant="ghost" onPress={onPress} style={styles.signOut} />;
}

const styles = StyleSheet.create({
  centred: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spaced: {
    marginTop: spacing.sm,
  },
  card: {
    marginTop: spacing.lg,
  },
  signOut: {
    marginTop: spacing.xxl,
  },
});
