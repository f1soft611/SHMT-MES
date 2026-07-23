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

type SaveResults = {
  process?: boolean;
  item?: boolean;
};

const renderDialog = (
  overrides: Partial<typeof mockSession> = {},
  saveResults: SaveResults = {},
) => {
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
    save: jest.fn().mockResolvedValue(saveResults.process ?? true),
  });
  Object.assign(mockItem, {
    dirty: mockSession.itemDirty,
    isSaving: mockSession.isSaving,
    save: jest.fn().mockResolvedValue(saveResults.item ?? true),
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
  it.each([
    ['공정 관리', 0, true, false],
    ['제품 관리', 1, false, true],
  ] as const)(
    '%s 저장 성공 후 다른 탭이 clean이면 닫는다',
    async (_tabName, tabIndex, processDirty, itemDirty) => {
      const { onClose } = renderDialog({
        tabIndex,
        processDirty,
        itemDirty,
        hasDirtyChanges: true,
      });
      const activeSave = tabIndex === 0 ? mockProcess.save : mockItem.save;

      fireEvent.click(screen.getByRole('button', { name: '저장' }));

      await waitFor(() => expect(activeSave).toHaveBeenCalledTimes(1));
      await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    },
  );

  it.each([
    ['공정 관리', 0],
    ['제품 관리', 1],
  ] as const)(
    '%s 저장 성공 후 다른 탭이 dirty이면 유지한다',
    async (_tabName, tabIndex) => {
      const { onClose } = renderDialog({
        tabIndex,
        processDirty: true,
        itemDirty: true,
        hasDirtyChanges: true,
      });
      const activeSave = tabIndex === 0 ? mockProcess.save : mockItem.save;

      fireEvent.click(screen.getByRole('button', { name: '저장' }));

      await waitFor(() => expect(activeSave).toHaveBeenCalledTimes(1));
      expect(onClose).not.toHaveBeenCalled();
      expect(screen.getByRole('dialog')).toBeVisible();
    },
  );

  it.each([
    ['공정 관리', 0, true, false, { process: false }],
    ['제품 관리', 1, false, true, { item: false }],
  ] as const)(
    '%s 저장 실패 시 다이얼로그를 유지한다',
    async (_tabName, tabIndex, processDirty, itemDirty, saveResults) => {
      const { onClose } = renderDialog(
        {
          tabIndex,
          processDirty,
          itemDirty,
          hasDirtyChanges: true,
        },
        saveResults,
      );
      const activeSave = tabIndex === 0 ? mockProcess.save : mockItem.save;

      fireEvent.click(screen.getByRole('button', { name: '저장' }));

      await waitFor(() => expect(activeSave).toHaveBeenCalledTimes(1));
      expect(onClose).not.toHaveBeenCalled();
      expect(screen.getByRole('dialog')).toBeVisible();
    },
  );

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
