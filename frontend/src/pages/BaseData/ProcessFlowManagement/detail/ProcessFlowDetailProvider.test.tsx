import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ProcessFlowSummary } from '../types';
import { ProcessFlowDetailProvider } from './ProcessFlowDetailProvider';
import { useDetailSessionContext } from './DetailSessionContext';
import { useItemDraftContext } from './ItemDraftContext';
import { useProcessDraftContext } from './ProcessDraftContext';

const mockProcessOne = {
  flowProcessId: 'FP-1', flowProcessCode: 'PROC-1', flowProcessName: '절단',
  equipmentFlag: 'N' as const, seq: 1, planFlag: 'Y' as const, lastFlag: 'N' as const,
};
const mockProcessTwo = { ...mockProcessOne, flowProcessId: 'FP-2' };
const mockItemOne = { flowItemId: 'FI-1', itemId: 'I-1', itemCode: 'ITEM-1', itemName: '품목 1' };
const mockItemTwo = { ...mockItemOne, flowItemId: 'FI-2' };
const mockAddedItem = { flowItemId: 'FI-NEW', itemId: 'I-NEW', itemCode: 'ITEM-NEW', itemName: '신규 품목' };
const mockCatalogItems = [
  { itemId: 'I-1', itemCode: 'ITEM-1', itemName: '품목 1' },
  { itemId: 'I-NEW', itemCode: 'ITEM-NEW', itemName: '신규 품목' },
];
const mockSaveItemsMutateAsync = jest.fn();
let mockItemsIsFetching = false;
let mockItemCatalogIsFetching = false;

Object.defineProperty(globalThis, 'crypto', {
  value: { randomUUID: jest.fn(() => 'generated-row-id') },
  configurable: true,
});

jest.mock('./useProcessFlowDetailQueries', () => ({
  useProcessFlowDetailQueries: (_open: boolean, flowId: string) => ({
    processes: { data: flowId === 'PF-2' ? [mockProcessTwo] : [mockProcessOne], isLoading: false, error: null, refetch: jest.fn() },
    items: { data: flowId === 'PF-2' ? [mockItemTwo] : [mockItemOne], isLoading: false, isFetching: mockItemsIsFetching, error: null, refetch: jest.fn() },
    processCatalog: { data: { result: { resultList: [] } }, isLoading: false, error: null, refetch: jest.fn() },
    itemCatalog: { data: { result: { resultList: mockCatalogItems, resultCnt: mockCatalogItems.length } }, isLoading: false, isFetching: mockItemCatalogIsFetching, error: null, refetch: jest.fn() },
  }),
}));
jest.mock('./useProcessFlowDetailMutations', () => ({
  useSaveProcessesMutation: () => ({ mutateAsync: jest.fn().mockResolvedValue({ processes: [mockProcessOne] }), isPending: false }),
  useSaveItemsMutation: () => ({ mutateAsync: mockSaveItemsMutateAsync, isPending: false }),
}));
jest.mock('../../../../components/common/Feedback/ToastProvider', () => ({ useToast: () => ({ showToast: jest.fn() }) }));

function Probe() {
  const session = useDetailSessionContext();
  const process = useProcessDraftContext();
  const item = useItemDraftContext();
  return <>
    <span>flow:{session.flow.processFlowId}</span>
    <span>process-dirty:{String(process.dirty)}</span>
    <span>item-dirty:{String(item.dirty)}</span>
    <span>item-rows:{item.rows.length}</span>
    <span>catalog-rows:{item.catalogRows.length}</span>
    <span>catalog-fetching:{String(item.isCatalogFetching)}</span>
    <span>applied-items-fetching:{String(item.isAppliedItemsFetching)}</span>
    <button onClick={() => item.remove(['FI-1'])}>dirty-items</button>
    <button onClick={() => item.add(['I-NEW'], mockCatalogItems)}>add-new-item</button>
    <button onClick={() => item.save()}>save-items</button>
    <button onClick={() => process.save()}>save-processes</button>
  </>;
}

const flowOne: ProcessFlowSummary = { processFlowId: 'PF-1', processFlowCode: 'FLOW-1', processFlowName: '공정흐름 1' };
const flowTwo: ProcessFlowSummary = { processFlowId: 'PF-2', processFlowCode: 'FLOW-2', processFlowName: '공정흐름 2' };
const provider = (flow: ProcessFlowSummary) => <ProcessFlowDetailProvider open processFlow={flow}><Probe /></ProcessFlowDetailProvider>;

describe('ProcessFlowDetailProvider', () => {
  beforeEach(() => {
    mockItemsIsFetching = false;
    mockItemCatalogIsFetching = false;
    mockSaveItemsMutateAsync.mockReset();
    mockSaveItemsMutateAsync.mockResolvedValue({
      addedItems: [mockAddedItem],
      deletedFlowItemIds: [],
    });
  });

  it('keeps item dirty after a successful process save', async () => {
    render(provider(flowOne));
    await screen.findByText('flow:PF-1');
    fireEvent.click(screen.getByText('dirty-items'));
    fireEvent.click(screen.getByText('save-processes'));
    await waitFor(() => expect(screen.getByText('process-dirty:false')).toBeVisible());
    expect(screen.getByText('item-dirty:true')).toBeVisible();
  });

  it('resets both drafts from canonical data when flow changes', async () => {
    const view = render(provider(flowOne));
    await screen.findByText('flow:PF-1');
    fireEvent.click(screen.getByText('dirty-items'));
    expect(screen.getByText('item-dirty:true')).toBeVisible();
    act(() => view.rerender(provider(flowTwo)));
    await screen.findByText('flow:PF-2');
    await waitFor(() => expect(screen.getByText('item-dirty:false')).toBeVisible());
  });

  it('filters applied catalog rows and rebuilds canonical rows after item save', async () => {
    render(provider(flowOne));
    await screen.findByText('flow:PF-1');

    expect(screen.getByText('catalog-rows:1')).toBeVisible();
    fireEvent.click(screen.getByText('add-new-item'));
    expect(screen.getByText('item-rows:2')).toBeVisible();
    expect(screen.getByText('catalog-rows:0')).toBeVisible();

    fireEvent.click(screen.getByText('save-items'));

    await waitFor(() => expect(screen.getByText('item-dirty:false')).toBeVisible());
    expect(screen.getByText('item-rows:2')).toBeVisible();
  });

  it('exposes catalog fetching without applied-items fetching', async () => {
    mockItemCatalogIsFetching = true;

    render(provider(flowOne));

    expect(await screen.findByText('catalog-fetching:true')).toBeVisible();
    expect(screen.getByText('applied-items-fetching:false')).toBeVisible();
  });

  it('exposes applied-items fetching without catalog fetching', async () => {
    mockItemsIsFetching = true;

    render(provider(flowOne));

    expect(await screen.findByText('applied-items-fetching:true')).toBeVisible();
    expect(screen.getByText('catalog-fetching:false')).toBeVisible();
  });
});
