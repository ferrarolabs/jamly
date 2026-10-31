/**
 * Story A4: add a suggestion, add free text, remove, save — and a failed save
 * changes nothing the band can see.
 */

import { render, screen, userEvent } from '@testing-library/react-native';

import { bandFailure } from '../../api/bandErrors';
import { InstrumentsEditor } from '../InstrumentsEditor';

function setup(onSave = jest.fn().mockResolvedValue(true)) {
  const onCancel = jest.fn();
  return { onSave, onCancel, user: userEvent.setup() };
}

describe('InstrumentsEditor', () => {
  it('adds a suggestion, adds free text, removes one, and saves the result', async () => {
    const { onSave, onCancel, user } = setup();
    await render(
      <InstrumentsEditor
        initial={['vox']}
        onSave={onSave}
        onCancel={onCancel}
        isSaving={false}
        failure={null}
      />,
    );

    await user.press(screen.getByRole('button', { name: 'Add drums' }));
    await user.type(screen.getByLabelText('Something else'), 'sax');
    await user.press(screen.getByRole('button', { name: 'Add' }));
    await user.press(screen.getByRole('button', { name: 'Remove vox' }));
    await user.press(screen.getByRole('button', { name: 'Save' }));

    expect(onSave).toHaveBeenCalledWith(['drums', 'sax']);
  });

  it('does not offer a suggestion that is already in the list', async () => {
    const { onSave, onCancel } = setup();
    await render(
      <InstrumentsEditor
        initial={['Drums']}
        onSave={onSave}
        onCancel={onCancel}
        isSaving={false}
        failure={null}
      />,
    );

    expect(screen.queryByRole('button', { name: 'Add drums' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Add bass' })).toBeTruthy();
  });

  it('keeps text typed but not added when saving', async () => {
    const { onSave, onCancel, user } = setup();
    await render(
      <InstrumentsEditor
        initial={[]}
        onSave={onSave}
        onCancel={onCancel}
        isSaving={false}
        failure={null}
      />,
    );

    await user.type(screen.getByLabelText('Something else'), ' harmonica ');
    await user.press(screen.getByRole('button', { name: 'Save' }));

    expect(onSave).toHaveBeenCalledWith(['harmonica']);
  });

  it('allows saving an empty list, and never asks for one', async () => {
    const { onSave, onCancel, user } = setup();
    await render(
      <InstrumentsEditor
        initial={['bass']}
        onSave={onSave}
        onCancel={onCancel}
        isSaving={false}
        failure={null}
      />,
    );

    await user.press(screen.getByRole('button', { name: 'Remove bass' }));
    await user.press(screen.getByRole('button', { name: 'Save' }));

    expect(onSave).toHaveBeenCalledWith([]);
  });

  it('on a failed save, shows the message and keeps the draft for another try', async () => {
    const onSave = jest.fn().mockResolvedValue(false);
    const { onCancel, user } = setup(onSave);
    const initial = ['vox'];

    const { rerender } = await render(
      <InstrumentsEditor
        initial={initial}
        onSave={onSave}
        onCancel={onCancel}
        isSaving={false}
        failure={null}
      />,
    );

    await user.press(screen.getByRole('button', { name: 'Add drums' }));
    await user.press(screen.getByRole('button', { name: 'Save' }));

    await rerender(
      <InstrumentsEditor
        initial={initial}
        onSave={onSave}
        onCancel={onCancel}
        isSaving={false}
        failure={bandFailure('offline')}
      />,
    );

    expect(screen.getByText("Can't reach Jamly — check your connection.")).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Remove drums' })).toBeTruthy();
    expect(initial).toEqual(['vox']);
  });
});
