import { render, within } from '@testing-library/react';
import ProcessFlowProcessTab from './ProcessFlowProcessTab';
import { useProcessDraftContext } from '../detail/ProcessDraftContext';
import { useProcessCatalogQuery } from '../detail/useProcessFlowDetailQueries';

jest.mock('../detail/ProcessDraftContext', () => ({
  useProcessDraftContext: jest.fn(),
}));

jest.mock('../detail/useProcessFlowDetailQueries', () => ({
  useProcessCatalogQuery: jest.fn(),
}));

jest.mock('../../../../components/common/Feedback/ToastProvider', () => ({
  useToast: () => ({ showToast: jest.fn() }),
}));

const mockedUseProcessDraftContext = useProcessDraftContext as jest.MockedFunction<
  typeof useProcessDraftContext
>;
const mockedUseProcessCatalogQuery = useProcessCatalogQuery as jest.MockedFunction<
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
    add: jest.fn(),
    remove: jest.fn(),
    updateSeq: jest.fn(),
    selectPlan: jest.fn(),
    toggleLast: jest.fn(),
    save: jest.fn().mockResolvedValue(true),
    retry: jest.fn().mockResolvedValue(undefined),
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
    refetch: jest.fn(),
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
});
