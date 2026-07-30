import type { Mock } from 'vitest';
import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useBomInquiry } from './useBomInquiry';
import bomService from '../../../../services/bomService';
import { BomItemSearchRow, BomTreeRow } from '../../../../types/bom';

vi.mock('../../../../services/bomService', () => ({
  default: {
    searchItems: vi.fn(),
    getBomTree: vi.fn(),
  },
}));

const setup = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);

  return renderHook(() => useBomInquiry(), { wrapper });
};

const searchRow = (overrides: Partial<BomItemSearchRow> = {}): BomItemSearchRow => ({
  itemSeq: 100,
  itemCode: 'PRD-001',
  itemName: '제품A',
  itemSpec: null,
  ...overrides,
});

const treeRow = (overrides: Partial<BomTreeRow> = {}): BomTreeRow => ({
  depth: '01',
  itemSeq: 100,
  itemCode: 'PRD-100',
  itemName: '제품A',
  matItemSeq: 200,
  matItemNo: 'MAT-200',
  matItemName: '부품A',
  matItemSpec: 'SPEC-200',
  ...overrides,
});

describe('useBomInquiry', () => {
  it('search 호출 시 bomService.searchItems 결과를 searchResults에 반영한다', async () => {
    (bomService.searchItems as Mock).mockResolvedValue({ resultList: [searchRow()], resultCnt: 1 });
    const { result } = setup();

    await act(async () => {
      result.current.search({ searchCnd: '2', searchWrd: '제품A' });
    });

    await waitFor(() => expect(result.current.searchResults).toHaveLength(1));
    expect(bomService.searchItems).toHaveBeenCalledWith('2', '제품A', 1, 10);
    expect(result.current.searchResults[0].itemName).toBe('제품A');
    expect(result.current.searchTotalCount).toBe(1);
  });

  it('paginationModel 변경 시 변경된 페이지로 bomService.searchItems를 재호출한다', async () => {
    (bomService.searchItems as Mock).mockResolvedValue({ resultList: [searchRow()], resultCnt: 30 });
    const { result } = setup();

    await act(async () => {
      result.current.search({ searchCnd: '2', searchWrd: '제품A' });
    });
    await waitFor(() => expect(result.current.searchResults).toHaveLength(1));

    await act(async () => {
      result.current.onPaginationModelChange({ page: 1, pageSize: 10 });
    });

    await waitFor(() =>
      expect(bomService.searchItems).toHaveBeenCalledWith('2', '제품A', 2, 10),
    );
  });

  it('selectItem 호출 시 해당 itemSeq로 BOM 트리를 조회한다', async () => {
    (bomService.searchItems as Mock).mockResolvedValue({ resultList: [searchRow()], resultCnt: 1 });
    (bomService.getBomTree as Mock).mockResolvedValue([treeRow()]);
    const { result } = setup();

    await act(async () => {
      result.current.selectItem(100);
    });

    await waitFor(() => expect(result.current.treeNodes).toHaveLength(1));
    expect(bomService.getBomTree).toHaveBeenCalledWith(100);
    expect(result.current.selectedItemSeq).toBe(100);
  });

  it('새 검색을 시작하면 이전의 선택된 품목과 트리 선택을 해제한다', async () => {
    (bomService.searchItems as Mock).mockResolvedValue({ resultList: [searchRow()], resultCnt: 1 });
    (bomService.getBomTree as Mock).mockResolvedValue([treeRow()]);
    const { result } = setup();

    await act(async () => {
      result.current.selectItem(100);
    });
    await waitFor(() => expect(result.current.selectedItemSeq).toBe(100));

    await act(async () => {
      result.current.search({ searchCnd: '2', searchWrd: '다른 품목' });
    });

    expect(result.current.selectedItemSeq).toBeNull();
  });
});
