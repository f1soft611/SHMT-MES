import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import bomService from '../../../../services/bomService';
import type { BomItemSearchRow, BomTreeNode } from '../../../../types/bom';

export function useBomInquiry() {
  const [selectedItemSeq, setSelectedItemSeq] = useState<number | null>(null);

  const searchMutation = useMutation<BomItemSearchRow[], Error, string>({
    mutationFn: (keyword: string) => bomService.searchItems(keyword),
  });

  const treeQuery = useQuery<BomTreeNode[]>({
    queryKey: ['bomTree', selectedItemSeq],
    queryFn: () => bomService.getBomTree(selectedItemSeq as number),
    enabled: selectedItemSeq !== null,
  });

  const search = (keyword: string) => {
    setSelectedItemSeq(null);
    searchMutation.mutate(keyword);
  };

  const selectItem = (itemSeq: number) => {
    setSelectedItemSeq(itemSeq);
  };

  return {
    search,
    searchResults: searchMutation.data ?? [],
    searchLoading: searchMutation.isPending,
    searchError: searchMutation.error,
    selectItem,
    selectedItemSeq,
    treeNodes: treeQuery.data ?? [],
    treeLoading: treeQuery.isFetching,
    treeError: treeQuery.error,
  };
}
