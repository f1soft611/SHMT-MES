import type { Mock } from 'vitest';
import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useBomInquiry } from './useBomInquiry';
import bomService from '../../../../services/bomService';
import { BomItemSearchRow, BomTreeNode } from '../../../../types/bom';

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
  itemNo: 'PRD-001',
  itemName: '제품A',
  itemSpec: null,
  ...overrides,
});

const treeNode = (overrides: Partial<BomTreeNode> = {}): BomTreeNode => ({
  key: '100-P10',
  nodeType: 'PROCESS',
  itemSeq: 100,
  label: '공정 10',
  children: [],
  ...overrides,
});

describe('useBomInquiry', () => {
  it('search 호출 시 bomService.searchItems 결과를 searchResults에 반영한다', async () => {
    (bomService.searchItems as Mock).mockResolvedValue([searchRow()]);
    const { result } = setup();

    await act(async () => {
      result.current.search('제품A');
    });

    await waitFor(() => expect(result.current.searchResults).toHaveLength(1));
    expect(bomService.searchItems).toHaveBeenCalledWith('제품A');
    expect(result.current.searchResults[0].itemName).toBe('제품A');
  });

  it('selectItem 호출 시 해당 itemSeq로 BOM 트리를 조회한다', async () => {
    (bomService.searchItems as Mock).mockResolvedValue([searchRow()]);
    (bomService.getBomTree as Mock).mockResolvedValue([treeNode()]);
    const { result } = setup();

    await act(async () => {
      result.current.selectItem(100);
    });

    await waitFor(() => expect(result.current.treeNodes).toHaveLength(1));
    expect(bomService.getBomTree).toHaveBeenCalledWith(100);
    expect(result.current.selectedItemSeq).toBe(100);
  });

  it('새 검색을 시작하면 이전의 선택된 품목과 트리 선택을 해제한다', async () => {
    (bomService.searchItems as Mock).mockResolvedValue([searchRow()]);
    (bomService.getBomTree as Mock).mockResolvedValue([treeNode()]);
    const { result } = setup();

    await act(async () => {
      result.current.selectItem(100);
    });
    await waitFor(() => expect(result.current.selectedItemSeq).toBe(100));

    await act(async () => {
      result.current.search('다른 품목');
    });

    expect(result.current.selectedItemSeq).toBeNull();
  });
});
