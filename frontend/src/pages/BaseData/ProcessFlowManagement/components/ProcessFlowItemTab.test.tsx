import type { MockedFunction } from 'vitest';
import { render, within } from '@testing-library/react';
import ProcessFlowItemTab from './ProcessFlowItemTab';
import { useItemDraftContext } from '../detail/ItemDraftContext';

vi.mock('../detail/ItemDraftContext', () => ({
  useItemDraftContext: vi.fn(),
}));

const mockedUseItemDraftContext = useItemDraftContext as MockedFunction<
  typeof useItemDraftContext
>;

describe('ProcessFlowItemTab', () => {
  it.each([
    [false, false, false, false],
    [true, false, true, false],
    [false, true, false, true],
    [true, true, true, true],
  ])(
    'shows loading only in its corresponding grid when catalog=%s and applied items=%s',
    (isCatalogFetching, isAppliedItemsFetching, catalogShowsProgress, appliedItemsShowProgress) => {
    mockedUseItemDraftContext.mockReturnValue({
      rows: [],
      catalogRows: [],
      catalogTotalCount: 0,
      dirty: false,
      isCatalogFetching,
      isAppliedItemsFetching,
      isSaving: false,
      error: null,
      add: vi.fn(),
      remove: vi.fn(),
      save: vi.fn().mockResolvedValue(true),
      retry: vi.fn().mockResolvedValue(undefined),
      setCatalogParams: vi.fn(),
    } as unknown as ReturnType<typeof useItemDraftContext>);

    const { container } = render(<ProcessFlowItemTab />);
    const [catalogGrid, appliedItemsGrid] = Array.from(
      container.querySelectorAll<HTMLElement>('.MuiDataGrid-root'),
    );

    const catalogProgress = within(catalogGrid).queryByRole('progressbar');
    const appliedItemsProgress = within(appliedItemsGrid).queryByRole('progressbar');

    if (catalogShowsProgress) {
      expect(catalogProgress).toHaveClass('MuiLinearProgress-root');
    } else {
      expect(catalogProgress).not.toBeInTheDocument();
    }
    if (appliedItemsShowProgress) {
      expect(appliedItemsProgress).toHaveClass('MuiLinearProgress-root');
    } else {
      expect(appliedItemsProgress).not.toBeInTheDocument();
    }
    expect(container.querySelectorAll('.MuiDataGrid-skeletonLoadingOverlay')).toHaveLength(0);
    },
  );

  it('uses linear progress for applied items while existing rows are refreshed', () => {
    mockedUseItemDraftContext.mockReturnValue({
      rows: [{
        rowId: 'applied-1',
        itemId: 'item-1',
        itemCode: 'ITEM-1',
        itemName: 'Applied item',
        specification: 'Spec',
        unitName: 'EA',
        unit: 'EA',
      }],
      catalogRows: [],
      catalogTotalCount: 0,
      dirty: false,
      isCatalogFetching: false,
      isAppliedItemsFetching: true,
      isSaving: false,
      error: null,
      add: vi.fn(),
      remove: vi.fn(),
      save: vi.fn().mockResolvedValue(true),
      retry: vi.fn().mockResolvedValue(undefined),
      setCatalogParams: vi.fn(),
    } as unknown as ReturnType<typeof useItemDraftContext>);

    const { container } = render(<ProcessFlowItemTab />);
    const [, appliedItemsGrid] = Array.from(
      container.querySelectorAll<HTMLElement>('.MuiDataGrid-root'),
    );

    expect(within(appliedItemsGrid).getByRole('progressbar')).toHaveClass(
      'MuiLinearProgress-root',
    );
  });
});
