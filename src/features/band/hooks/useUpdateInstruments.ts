import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';

import { useAuthUser } from '@/features/auth';
import { updateMyInstruments } from '../api/band.repo';
import type { BandFailure, RosterMember } from '../types';
import { bandRosterKey } from './useBandRoster';

/**
 * Story A4: save what I play in this band.
 *
 * Not optimistic. A failed save must leave the previous list on the roster
 * (the issue's acceptance criteria), so the cache changes only once the
 * database has said yes.
 */
export function useUpdateInstruments(bandId: string) {
  const user = useAuthUser();
  const queryClient = useQueryClient();
  const [isSubmitting, setSubmitting] = useState(false);
  const [failure, setFailure] = useState<BandFailure | null>(null);

  const submit = useCallback(
    async (instruments: readonly string[]): Promise<boolean> => {
      if (!user) return false;

      setSubmitting(true);
      setFailure(null);

      const result = await updateMyInstruments(bandId, user.id, instruments);

      setSubmitting(false);

      if (!result.ok) {
        setFailure(result.failure);
        return false;
      }

      queryClient.setQueryData<RosterMember[]>(bandRosterKey(bandId), (roster) =>
        roster?.map((member) =>
          member.userId === user.id ? { ...member, instruments: result.instruments } : member,
        ),
      );
      await queryClient.invalidateQueries({ queryKey: bandRosterKey(bandId) });

      return true;
    },
    [bandId, queryClient, user],
  );

  const reset = useCallback(() => setFailure(null), []);

  return { submit, isSubmitting, failure, reset };
}
