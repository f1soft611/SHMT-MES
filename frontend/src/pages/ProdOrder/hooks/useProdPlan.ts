import { useEffect, useState } from 'react';
import { GridPaginationModel } from '@mui/x-data-grid';
import { productionOrderService } from '../../../services/productionOrderService';
import {ProdPlanRow, ProdPlanSearchParams} from "../../../types/productionOrder";

export function useProdPlan() {
  // 검색 조건
  const today = new Date().toISOString().slice(0, 10);
  const dateFrom = new Date();
  dateFrom.setDate(dateFrom.getDate() - 30);
  const dateFromStr = dateFrom.toISOString().slice(0, 10);

  // 검색조건
  const [search, setSearch] = useState<ProdPlanSearchParams>({
    workplace: '',
    equipment: '',
    dateFrom: dateFromStr,
    dateTo: today,
    orderFlag: 'PLANNED'
  });

  // 페이징
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });

  // 조회 결과 state
  const [rows, setRows] = useState<ProdPlanRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [resultCnt, setResultCnt] = useState(0);

  /**
   * 검색 버튼 클릭 트리거용 state
   * (검색 조건 변경 시 자동 조회 방지)
   */
  const [searchTrigger, setSearchTrigger] = useState(0);


  /** ======================
   *  생산계획 조회
   *  ====================== */
  const fetchProdPlan = async () => {
    try {
      setLoading(true);

      const response = await productionOrderService.getProdPlans({
        ...search,
        page: paginationModel.page,
        size: paginationModel.pageSize,
      });
      setRows(response.result.resultList);
      setResultCnt(response.result.resultCnt ?? 0);
    } catch (err: any) {
      // 조회실패 초기화
      setRows([]);
      setResultCnt(0);
    } finally {
      setLoading(false);
    }
  };

  /** ======================
   *  페이지 변경 핸들러
   *  ====================== */
  const handlePaginationChange = (model: GridPaginationModel) => {
    setPaginationModel(model);
  };

  /** ======================
   *  검색 조건 변경
   *  ====================== */
  const handleSearchChange = (name: string, value: string) => {
    setSearch((prev) => ({ ...prev, [name]: value }));
  };

  /** ======================
   *  검색 실행
   *  - page 초기화
   *  - searchTrigger 증가로 조회 유도
   *  ====================== */
  const handleSearch = () => {
    setPaginationModel((p) => ({ ...p, page: 0 }));
    setSearchTrigger((t) => t + 1);
  };


  /** ======================
   *  조회 트리거
   *  - 페이지 변경
   *  - 페이지 사이즈 변경
   *  - 검색 실행 시
   *  ====================== */
  useEffect(() => {
    fetchProdPlan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginationModel.page, paginationModel.pageSize, searchTrigger]);

  return {
    planRows: rows,
    loading,
    resultCnt,
    search,
    handleSearchChange,
    handleSearch,
    paginationModel,
    setPaginationModel,
    handlePaginationChange,
    fetchProdPlan, // 외부에서 강제 재조회용
  };
}
