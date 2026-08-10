import type { MockedFunction } from 'vitest';
import { render, within } from '@testing-library/react';
import ProcessFlowProcessTab from './ProcessFlowProcessTab';
import { useProcessDraftContext } from '../detail/ProcessDraftContext';
import { useProcessCatalogQuery } from '../detail/useProcessFlowDetailQueries';

vi.mock('../detail/ProcessDraftContext', () => ({
  useProcessDraftContext: vi.fn(),
}));

vi.mock('../detail/useProcessFlowDetailQueries', () => ({
  useProcessCatalogQuery: vi.fn(),
}));

vi.mock('../../../../components/common/Feedback/ToastProvider', () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));

const mockedUseProcessDraftContext = useProcessDraftContext as MockedFunction<
  typeof useProcessDraftContext
>;
const mockedUseProcessCatalogQuery = useProcessCatalogQuery as MockedFunction<
  typeof useProcessCatalogQuery
>;

const renderLoadingGrids = (withRows: boolean) => {
  mockedUseProcessDraftContext.mockReturnValue({
    rows: withRows
      ? [{
          rowId: 'applied-1',
          flowProcessId: 'flow-process-1',
          flowProcessCode: 'PROC-1',
          flowProcessName: 'Applied process',
          equipmentFlag: 'N',
          seq: 1,
          planFlag: 'Y',
          lastFlag: 'N',
        }]
      : [],
    dirty: false,
    isLoading: true,
    isSaving: false,
    error: null,
    add: vi.fn(),
    remove: vi.fn(),
    updateSeq: vi.fn(),
    selectPlan: vi.fn(),
    toggleLast: vi.fn(),
    save: vi.fn().mockResolvedValue(true),
    retry: vi.fn().mockResolvedValue(undefined),
  } as unknown as ReturnType<typeof useProcessDraftContext>);

  mockedUseProcessCatalogQuery.mockReturnValue({
    data: {
      result: {
        resultList: withRows
          ? [{
              processId: 'process-1',
              processCode: 'PROC-1',
              processName: 'Catalog process',
              equipmentIntegrationYn: 'N',
            }]
          : [],
        resultCnt: withRows ? 1 : 0,
      },
    },
    isLoading: true,
    error: null,
    refetch: vi.fn(),
  } as unknown as ReturnType<typeof useProcessCatalogQuery>);

  const { container } = render(<ProcessFlowProcessTab />);
  return {
    container,
    grids: Array.from(container.querySelectorAll<HTMLElement>('.MuiDataGrid-root')),
  };
};

describe('ProcessFlowProcessTab', () => {
  it.each([
    ['empty initial loading', false],
    ['refreshing existing rows', true],
  ])('uses linear progress in both grids while %s', (_caseName, withRows) => {
    const { container, grids } = renderLoadingGrids(withRows);

    expect(grids).toHaveLength(2);
    grids.forEach((grid) => {
      expect(within(grid).getByRole('progressbar')).toHaveClass('MuiLinearProgress-root');
    });
    expect(container.querySelectorAll('.MuiDataGrid-skeletonLoadingOverlay')).toHaveLength(0);
  });

    it('requests the full unpaged catalog for the left grid', () => {
        renderLoadingGrids(false);

        expect(mockedUseProcessCatalogQuery).toHaveBeenCalledWith(
            expect.objectContaining({ unpaged: true }),
        );
    });

    it('renders the left grid without pagination controls', () => {
        const { grids } = renderLoadingGrids(true);

        expect(within(grids[0]).queryByRole('combobox', { name: /rows per page/i })).toBeNull();
    });
});
