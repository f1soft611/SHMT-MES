import { useFetchWorkplaces } from '../../../hooks/useFetchWorkplaces';
import { useProdOrder } from './useProdOrder';
import { useProdResultDialog } from './useProdResultDialog';
import { useEffect, useState } from 'react';
import {ProdPlanRow} from "../../../types/productionOrder";
import {ProdResultOrderRow} from "../../../types/productionResult";

export function useProductionResult(rowData: ProdPlanRow | null) {
  // 검색필터 작업장 fetch 공통 훅
  const wpfetchHook = useFetchWorkplaces();

  // 생산지시
  const prodOrder = useProdOrder();

  // dialog 상태 훅
  const dialog = useProdResultDialog();

  // 선택된 생산지시
  const [selectedOrder, setSelectedOrder] = useState<any>([]);
  const [selectedRow, setSelectedRow] = useState<ProdResultOrderRow | null>(null);

  // 생산지시 row 선택했을때
  const handleResultSelect = async (row: ProdResultOrderRow) => {
    setSelectedOrder(row);
    dialog.openDialog();
  };
  const handleRowClick = (row: ProdResultOrderRow) => {
    setSelectedRow(row);
  };


  /** ======================
   *  생산지시에서 넘어오는경우 rowData !== null
   *  - 검색 조건 자동 세팅
   *  - 즉시 조회 실행
   *  ====================== */
  useEffect(() => {
    if (!rowData) return;

    // YYYYMMDD → YYYY-MM-DD
    const formatDate = (v: string) =>
      `${v.slice(0, 4)}-${v.slice(4, 6)}-${v.slice(6, 8)}`;

    if (!rowData?.prodDate) return;

    const nextSearch = {
      dateFrom: formatDate(rowData.prodplanDate),
      dateTo: formatDate(rowData.prodplanDate),
      workplace: rowData.workcenterCode,
      equipment: '',
      keyword: rowData.prodplanDetailId,
    };

    // 1) 검색필터 UI 세팅 (화면 표시용)
    prodOrder.setSearch((prev) => ({ ...prev, ...nextSearch }));

    // 2) 실제 조회 파라미터 세팅 (조회 트리거)
    prodOrder.setSearchParams({
      ...nextSearch,
      dateFrom: rowData.prodplanDate,
      dateTo: rowData.prodplanDate,
    });

    // 3) 첫 페이지로
    const model = { ...prodOrder.paginationModel, page: 0 };
    prodOrder.onPaginationChange(model);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowData]);

  return {
    search: prodOrder.search,
    handleSearchChange: prodOrder.handleSearchChange,
    handleSearch: prodOrder.handleSearch,

    rows: prodOrder.rows,
    rowCount: prodOrder.rowCount,
    loading: prodOrder.loading,

    pagination: prodOrder.paginationModel,
    onPaginationChange: prodOrder.onPaginationChange,
    onFilterChange: prodOrder.onFilterChange,

    workplaces: wpfetchHook.workplaces,
    refetchWorkplaces: wpfetchHook.refetchWorkplaces,

    selectedRow,
    handleRowClick,

    handleResultSelect,

    order: selectedOrder,
    open: dialog.open,
    openDialog: dialog.openDialog,
    closeDialog: dialog.closeDialog,
    submit: dialog.submit,
  };
}
