import { useEffect, useRef, useState } from 'react';
import productionWipInventoryService from '../../../services/productionWipInventoryService';
import {
  WipInventoryRow,
  WipInventorySearchParams,
} from '../../../types/productionWipInventory';

import { useToast } from '../../../components/common/Feedback/ToastProvider';
import { processService } from '../../../services/processService';
import { Process } from '../../../types/process';
import { GridPaginationModel } from '@mui/x-data-grid';

interface WipInventorySearch {
  searchDate: string;
  workCode: string;
  searchKeyword: string;
}

export function useWipInventoryStatus() {
  const { showToast } = useToast();

  const [search, setSearch] = useState<WipInventorySearch>({
    searchDate: '',
    workCode: '',
    searchKeyword: '',
  });
  const [rows, setRows] = useState<WipInventoryRow[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 100,
  });
  const [processOptions, setProcessOptions] = useState<Process[]>([]);

  // 검색 실행 여부를 추적 (초기 진입 시 자동 조회 방지)
  const hasSearched = useRef(false);
  const searchParamsRef = useRef<WipInventorySearch>(search);

  useEffect(() => {
    const fetchProcesses = async () => {
      try {
        const data = await processService.getProcessList(0, 1000);
        setProcessOptions(data?.result?.resultList ?? []);
      } catch {
        setProcessOptions([]);
      }
    };
    fetchProcesses();
  }, []);

  const handleSearchChange = (name: string, value: string) => {
    setSearch((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    searchParamsRef.current = search;
    hasSearched.current = true;
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  };

  const handlePaginationModelChange = (model: GridPaginationModel) => {
    setPaginationModel(model);
  };

  useEffect(() => {
    if (!hasSearched.current) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const params: WipInventorySearchParams = {
          searchDate: searchParamsRef.current.searchDate || undefined,
          workCode: searchParamsRef.current.workCode || undefined,
          searchKeyword: searchParamsRef.current.searchKeyword || undefined,
          offset: paginationModel.page * paginationModel.pageSize,
          size: paginationModel.pageSize,
        };
        const data = await productionWipInventoryService.getWipInventoryList(params);

        if (data?.resultCode !== 200) {
          showToast({ message: data?.resultMessage ?? '조회 실패', severity: 'error' });
          setRows([]);
          setRowCount(0);
          return;
        }

        setRows(data?.result?.resultList ?? []);
        setRowCount(data?.result?.resultCnt ?? 0);
      } catch (err: any) {
        showToast({ message: err?.message ?? '재공재고 조회 중 오류가 발생했습니다.', severity: 'error' });
        setRows([]);
        setRowCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [paginationModel]);

  return {
    search,
    handleSearchChange,
    handleSearch,
    rows,
    rowCount,
    loading,
    paginationModel,
    handlePaginationModelChange,
    processOptions,
  };
}
