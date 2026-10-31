/**
 * Story A4: only my own row can be edited, and a failed save leaves the
 * roster showing what it showed before.
 */

import { render, screen, userEvent } from '@testing-library/react-native';

import { bandFailure } from '../../api/bandErrors';
import type { RosterMember } from '../../types';
import { Roster } from '../Roster';

const mockUpdate = {
  submit: jest.fn(),
  isSubmitting: false,
  failure: null as ReturnType<typeof bandFailure> | null,
  reset: jest.fn(),
};

jest.mock('../../hooks/useUpdateInstruments', () => ({
  useUpdateInstruments: () => mockUpdate,
}));

const members: RosterMember[] = [
  {
    userId: 'u-1',
    displayName: 'Elia',
    role: 'leader',
    instruments: ['drums', 'vox'],
    joinedAt: '2026-09-16T09:00:00.000Z',
  },
  {
    userId: 'u-2',
    displayName: 'Sam',
    role: 'member',
    instruments: [],
    joinedAt: '2026-09-17T09:00:00.000Z',
  },
];

beforeEach(() => {
  mockUpdate.submit.mockReset();
  mockUpdate.failure = null;
});

describe('Roster', () => {
  it('shows "Edit" on my own row only', async () => {
    await render(<Roster bandId="b-1" members={members} myUserId="u-2" />);

    expect(screen.getAllByRole('button', { name: 'Edit' })).toHaveLength(1);
  });

  it('shows no "Edit" when nobody signed in is on the roster', async () => {
    await render(<Roster bandId="b-1" members={members} myUserId={null} />);

    expect(screen.queryByRole('button', { name: 'Edit' })).toBeNull();
  });

  it('shows instruments as a plain list', async () => {
    await render(<Roster bandId="b-1" members={members} myUserId="u-2" />);

    expect(screen.getByText('Leader · drums, vox')).toBeTruthy();
    expect(screen.getByText('Member')).toBeTruthy();
  });

  it('keeps the old list on the roster when saving fails', async () => {
    const user = userEvent.setup();
    mockUpdate.submit.mockImplementation(async () => {
      mockUpdate.failure = bandFailure('offline');
      return false;
    });

    await render(<Roster bandId="b-1" members={members} myUserId="u-1" />);

    await user.press(screen.getByRole('button', { name: 'Edit' }));
    await user.press(screen.getByRole('button', { name: 'Remove vox' }));
    await user.press(screen.getByRole('button', { name: 'Save' }));

    expect(mockUpdate.submit).toHaveBeenCalledWith(['drums']);
    expect(screen.getByText('Leader · drums, vox')).toBeTruthy();
    // Still editing, so the draft can be saved again once back online.
    expect(screen.getByRole('button', { name: 'Save' })).toBeTruthy();
  });

  it('tells the screen while I edit, so it can hide the other primary action', async () => {
    const user = userEvent.setup();
    const onEditingChange = jest.fn();
    mockUpdate.submit.mockResolvedValue(true);

    await render(
      <Roster
        bandId="b-1"
        members={members}
        myUserId="u-1"
        onEditingChange={onEditingChange}
      />,
    );

    await user.press(screen.getByRole('button', { name: 'Edit' }));
    expect(onEditingChange).toHaveBeenLastCalledWith(true);

    await user.press(screen.getByRole('button', { name: 'Cancel' }));
    expect(onEditingChange).toHaveBeenLastCalledWith(false);

    await user.press(screen.getByRole('button', { name: 'Edit' }));
    await user.press(screen.getByRole('button', { name: 'Save' }));
    expect(onEditingChange).toHaveBeenLastCalledWith(false);
  });
});
