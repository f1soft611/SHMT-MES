import { useFetchWorkplaces } from '../../../hooks/useFetchWorkplaces';
import { useProdOrder } from './useProdOrder';
import { useProdResultDialog } from './useProdResultDialog';
import { useEffect, useState } from 'react';
import {ProdPlanRow} from "../../../types/productionOrder";

export function useProductionResult(rowData: ProdPlanRow | null) {
  // 검색필터 작업장 fetch 공통 훅
  const wpfetchHook = useFetchWorkplaces();

  // 생산지시
  const prodOrder = useProdOrder();

  // dialog 상태 훅
  const dialog = useProdResultDialog();

  // 선택된 생산지시
  const [selectedOrder, setSelectedOrder] = useState<any>([]);

  // 생산지시 row 선택했을때
  const handleResultSelect = async (row: any) => {
    setSelectedOrder(row);
    dialog.openDialog();
  };

  // 생산지시에서 넘어오는경우 rowData !== null
  useEffect(() => {
    if (!rowData) return;

    const formatDate = (v: string) =>
      `${v.slice(0, 4)}-${v.slice(4, 6)}-${v.slice(6, 8)}`;

    if (!rowData?.prodDate) return;

    const nextSearch = {
      workplace: rowData.workcenterCode,
      equipment: '',
      dateFrom: formatDate(rowData.prodDate),
      dateTo: formatDate(rowData.prodDate),
      keyword: rowData.prodplanId,
    };

    // 1) 검색필터 UI 세팅
    prodOrder.setSearch((prev) => ({ ...prev, ...nextSearch }));

    // 2) 실제 조회 파라미터 세팅 (조회 트리거)
    prodOrder.setSearchParams({
      ...nextSearch,
      dateFrom: rowData.prodDate,
      dateTo: rowData.prodDate,
    });

    // 3) 첫 페이지로
    prodOrder.setPagination((prev) => ({ ...prev, page: 0 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowData]);

  return {
    search: prodOrder.search,
    handleSearchChange: prodOrder.handleSearchChange,
    handleSearch: prodOrder.handleSearch,

    rows: prodOrder.rows,
    rowCount: prodOrder.rowCount,
    loading: prodOrder.loading,

    pagination: prodOrder.pagination,
    setPagination: prodOrder.setPagination,
    handlePageChange: prodOrder.handlePageChange,
    handlePageSizeChange: prodOrder.handlePageSizeChange,

    workplaces: wpfetchHook.workplaces,
    refetchWorkplaces: wpfetchHook.refetchWorkplaces,

    handleResultSelect,

    order: selectedOrder,
    open: dialog.open,
    openDialog: dialog.openDialog,
    closeDialog: dialog.closeDialog,
    submit: dialog.submit,
  };
}
