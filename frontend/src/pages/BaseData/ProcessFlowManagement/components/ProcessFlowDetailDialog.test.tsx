import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import ProcessFlowDetailDialog from './ProcessFlowDetailDialog';

const mockSession = {
  flow: { processFlowId: 'PF-1', processFlowCode: 'FLOW-1', processFlowName: '흐름' },
  tabIndex: 0 as 0 | 1,
  setTabIndex: jest.fn(),
  processDirty: false,
  itemDirty: false,
  hasDirtyChanges: false,
  isSaving: false,
  discardAll: jest.fn(),
};
const mockProcess = {
  rows: [],
  dirty: false,
  isLoading: false,
  isSaving: false,
  error: null,
  add: jest.fn(),
  remove: jest.fn(),
  updateSeq: jest.fn(),
  selectPlan: jest.fn(),
  toggleLast: jest.fn(),
  save: jest.fn().mockResolvedValue(true),
  retry: jest.fn(),
};
const mockItem = {
  rows: [],
  catalogRows: [],
  catalogTotalCount: 0,
  dirty: false,
  isCatalogFetching: false,
  isAppliedItemsFetching: false,
  isSaving: false,
  error: null,
  add: jest.fn(),
  remove: jest.fn(),
  save: jest.fn().mockResolvedValue(true),
  retry: jest.fn(),
  setCatalogParams: jest.fn(),
};

jest.mock('../detail/ProcessFlowDetailProvider', () => ({
  ProcessFlowDetailProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
jest.mock('../detail/DetailSessionContext', () => ({
  useDetailSessionContext: () => mockSession,
}));
jest.mock('../detail/ProcessDraftContext', () => ({
  useProcessDraftContext: () => mockProcess,
}));
jest.mock('../detail/ItemDraftContext', () => ({
  useItemDraftContext: () => mockItem,
}));
jest.mock('./ProcessFlowProcessTab', () => () => <div>process-tab</div>);
jest.mock('./ProcessFlowItemTab', () => () => <div>item-tab</div>);

const renderDialog = (overrides: Partial<typeof mockSession> = {}) => {
  Object.assign(mockSession, {
    tabIndex: 0,
    processDirty: false,
    itemDirty: false,
    hasDirtyChanges: false,
    isSaving: false,
    ...overrides,
  });
  Object.assign(mockProcess, {
    dirty: mockSession.processDirty,
    isSaving: mockSession.isSaving,
    save: jest.fn().mockResolvedValue(true),
  });
  Object.assign(mockItem, {
    dirty: mockSession.itemDirty,
    isSaving: mockSession.isSaving,
    save: jest.fn().mockResolvedValue(true),
  });
  const onClose = jest.fn();

  render(
    <ProcessFlowDetailDialog
      open
      onClose={onClose}
      selectedFlow={{
        workplaceCode: 'W-1',
        processFlowId: 'PF-1',
        processFlowCode: 'FLOW-1',
        processFlowName: '흐름',
      }}
      initialTab={0}
    />,
  );

  return { onClose };
};

describe('ProcessFlowDetailDialog', () => {
  it('keeps dialog open after current tab save succeeds', async () => {
    const { onClose } = renderDialog({
      processDirty: true,
      hasDirtyChanges: true,
    });

    fireEvent.click(screen.getByRole('button', { name: '저장' }));

    await waitFor(() => expect(mockProcess.save).toHaveBeenCalled());
    expect(screen.getByRole('dialog')).toBeVisible();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('shows confirmation when closing with dirty changes', () => {
    renderDialog({
      itemDirty: true,
      hasDirtyChanges: true,
    });

    fireEvent.click(screen.getByRole('button', { name: '닫기' }));

    expect(
      screen.getByText('저장하지 않은 변경이 있습니다. 변경을 버리고 닫으시겠습니까?'),
    ).toBeVisible();
  });

  it('blocks close button while saving', () => {
    renderDialog({ isSaving: true });

    expect(screen.getByRole('button', { name: '닫기' })).toBeDisabled();
  });
});
