import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import ProcessFlowDetailDialog from './ProcessFlowDetailDialog';

const mockShowToast = vi.fn();
let mockOnDetailDialogExited: (() => void) | undefined;

vi.mock('../../../../components/common/Feedback/ToastProvider', () => ({
  useToast: () => ({ showToast: mockShowToast }),
}));

vi.mock('@mui/material', async () => {
  const actual = await vi.importActual<typeof import('@mui/material')>('@mui/material');
  const ActualDialog = actual.Dialog;

  return {
    ...actual,
    Dialog: ({
      slotProps,
      ...props
    }: React.ComponentProps<typeof ActualDialog>) => {
      if (props.maxWidth === 'xl') {
        mockOnDetailDialogExited = slotProps?.transition?.onExited;
      }
      return <ActualDialog {...props} slotProps={slotProps} />;
    },
  };
});

const mockSession = {
  flow: { processFlowId: 'PF-1', processFlowCode: 'FLOW-1', processFlowName: '흐름' },
  tabIndex: 0 as 0 | 1,
  setTabIndex: vi.fn(),
  processDirty: false,
  itemDirty: false,
  hasDirtyChanges: false,
  isSaving: false,
  discardAll: vi.fn(),
};
const mockProcess = {
  rows: [],
  dirty: false,
  isLoading: false,
  isSaving: false,
  error: null,
  add: vi.fn(),
  remove: vi.fn(),
  updateSeq: vi.fn(),
  selectPlan: vi.fn(),
  toggleLast: vi.fn(),
  save: vi.fn().mockResolvedValue(true),
  retry: vi.fn(),
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
  add: vi.fn(),
  remove: vi.fn(),
  save: vi.fn().mockResolvedValue(true),
  retry: vi.fn(),
  setCatalogParams: vi.fn(),
};

vi.mock('../detail/ProcessFlowDetailProvider', () => ({
  ProcessFlowDetailProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock('../detail/DetailSessionContext', () => ({
  useDetailSessionContext: () => mockSession,
}));
vi.mock('../detail/ProcessDraftContext', () => ({
  useProcessDraftContext: () => mockProcess,
}));
vi.mock('../detail/ItemDraftContext', () => ({
  useItemDraftContext: () => mockItem,
}));
vi.mock('./ProcessFlowProcessTab', () => ({ default: () => <div>process-tab</div> }));
vi.mock('./ProcessFlowItemTab', () => ({ default: () => <div>item-tab</div> }));

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
    save: vi.fn().mockResolvedValue(saveResults.process ?? true),
  });
  Object.assign(mockItem, {
    dirty: mockSession.itemDirty,
    isSaving: mockSession.isSaving,
    save: vi.fn().mockResolvedValue(saveResults.item ?? true),
  });
  const onClose = vi.fn();

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
  beforeEach(() => {
    mockShowToast.mockClear();
    mockOnDetailDialogExited = undefined;
  });

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
      expect(mockShowToast).not.toHaveBeenCalled();
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

  it.each([
    [0, true, false, '공정 저장이 완료되었습니다.'],
    [1, false, true, '제품 저장이 완료되었습니다.'],
  ] as const)(
    'defers a clean save success toast until the detail dialog has exited',
    async (tabIndex, processDirty, itemDirty, message) => {
      const { onClose } = renderDialog({
        tabIndex,
        processDirty,
        itemDirty,
        hasDirtyChanges: true,
      });

      fireEvent.click(screen.getByRole('button', { name: '저장' }));

      await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
      expect(mockShowToast).not.toHaveBeenCalled();
      expect(mockOnDetailDialogExited).toEqual(expect.any(Function));

      mockOnDetailDialogExited?.();

      expect(mockShowToast).toHaveBeenCalledWith({ message, severity: 'success' });
    },
  );

  it.each([
    [0, '공정 저장이 완료되었습니다.'],
    [1, '제품 저장이 완료되었습니다.'],
  ] as const)(
    'shows a dirty save success toast without closing the detail dialog',
    async (tabIndex, message) => {
      const { onClose } = renderDialog({
        tabIndex,
        processDirty: true,
        itemDirty: true,
        hasDirtyChanges: true,
      });

      fireEvent.click(screen.getByRole('button', { name: '저장' }));

      await waitFor(() =>
        expect(mockShowToast).toHaveBeenCalledWith({ message, severity: 'success' }),
      );
      expect(onClose).not.toHaveBeenCalled();
    },
  );

  it('does not show a success toast when manually closing a clean dialog', () => {
    const { onClose } = renderDialog();

    fireEvent.click(screen.getByRole('button', { name: '닫기' }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(mockOnDetailDialogExited).toEqual(expect.any(Function));

    mockOnDetailDialogExited?.();

    expect(mockShowToast).not.toHaveBeenCalled();
  });
});
