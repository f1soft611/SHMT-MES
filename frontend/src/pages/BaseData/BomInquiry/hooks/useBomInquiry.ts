import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { GridPaginationModel } from '@mui/x-data-grid';
import bomService from '../../../../services/bomService';
import type { BomSearchCondition } from '../components/BomSearchPanel';
import type { BomTreeRow } from '../../../../types/bom';

const DEFAULT_PAGINATION: GridPaginationModel = { page: 0, pageSize: 10 };

export function useBomInquiry() {
  const [selectedItemSeq, setSelectedItemSeq] = useState<number | null>(null);
  const [searchParams, setSearchParams] = useState<BomSearchCondition | null>(null);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>(DEFAULT_PAGINATION);

  const searchQuery = useQuery({
    queryKey: ['bomItemSearch', searchParams, paginationModel],
    queryFn: () =>
      bomService.searchItems(
        searchParams!.searchCnd,
        searchParams!.searchWrd,
        paginationModel.page + 1,
        paginationModel.pageSize,
      ),
    enabled: searchParams !== null,
    placeholderData: keepPreviousData,
  });

  const treeQuery = useQuery<BomTreeRow[]>({
    queryKey: ['bomTree', selectedItemSeq],
    queryFn: () => bomService.getBomTree(selectedItemSeq as number),
    enabled: selectedItemSeq !== null,
  });

  const search = (condition: BomSearchCondition) => {
    setSelectedItemSeq(null);
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
    setSearchParams(condition);
  };

  const selectItem = (itemSeq: number) => {
    setSelectedItemSeq(itemSeq);
  };

  return {
    search,
    searchResults: searchQuery.data?.resultList ?? [],
    searchTotalCount: searchQuery.data?.resultCnt ?? 0,
    searchLoading: searchQuery.isFetching,
    searchError: searchQuery.error,
    paginationModel,
    onPaginationModelChange: setPaginationModel,
    selectItem,
    selectedItemSeq,
    treeNodes: treeQuery.data ?? [],
    treeLoading: treeQuery.isFetching,
    treeError: treeQuery.error,
  };
}
