import { useEffect, useState } from 'react';
import { GridPaginationModel } from '@mui/x-data-grid';
import { useProcessFlowListQuery } from '../useProcessFlowListQuery';

const SEARCH_STORAGE_KEY = 'processFlowManagement.searchParams';

interface ProcessFlowSearchParams {
  searchCnd: string;
  searchWrd: string;
  status: string;
}

const getStoredSearchParams = (): ProcessFlowSearchParams => {
  try {
    const stored = sessionStorage.getItem(SEARCH_STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore
  }
  return {
    searchCnd: '1',
    searchWrd: '',
    status: '',
  };
};

export function useProcessFlowList() {
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [searchParams, setSearchParams] = useState(getStoredSearchParams);
  const [inputValues, setInputValues] = useState(getStoredSearchParams);
  const query = useProcessFlowListQuery({
    page: paginationModel.page,
    pageSize: paginationModel.pageSize,
    ...searchParams,
  });
  const result = query.data?.result;

  const handleInputChange = (field: string, value: string) => {
    setInputValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSearch = () => {
    setSearchParams({ ...inputValues });
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  };

  useEffect(() => {
    try {
      sessionStorage.setItem(SEARCH_STORAGE_KEY, JSON.stringify(searchParams));
    } catch {
      // ignore
    }
  }, [searchParams]);

  return {
    rows: result?.resultList ?? [],
    rowCount: result?.resultCnt ?? 0,
    loading: query.isLoading,
    error: query.error,
    paginationModel,
    setPaginationModel,
    searchParams,
    setSearchParams,
    inputValues,
    setInputValues,
    handleInputChange,
    handleSearch,
    fetchProcessFlows: query.refetch,
  };
}
