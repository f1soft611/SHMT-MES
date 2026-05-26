import { useEffect, useState } from 'react';
import { GridPaginationModel } from '@mui/x-data-grid';
import dayjs from 'dayjs';
import { productionOrderService } from '../../../services/productionOrderService';
import { ProdPlanRow, ProdPlanSearchParams } from '../../../types/productionOrder';
import { useToast } from '../../../components/common/Feedback/ToastProvider';

const SESSION_KEY = 'prod-order-search';

function getDefaultSearch(): ProdPlanSearchParams {
  return {
    workplace: '',
    equipment: '',
    keyword: '',
    dateFrom: dayjs().format('YYYY-MM-DD'),
    dateTo: dayjs().add(7, 'day').format('YYYY-MM-DD'),
    prodFrom: '',
    prodTo: '',
    orderFlag: 'PLANNED',
  };
}

export function useProdPlan() {

  const { showToast } = useToast();

  // 검색조건 — 초기값을 sessionStorage에서 읽음
  const [search, setSearch] = useState<ProdPlanSearchParams>(() => {
    const saved = sessionStorage.getItem(SESSION_KEY);
    return saved ? JSON.parse(saved) : getDefaultSearch();
  });

  // 페이징
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 20,
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

      const data = await productionOrderService.getProdPlans({
        ...search,
        page: paginationModel.page,
        size: paginationModel.pageSize,
      });

      if (data.resultCode !== 200) {
        showToast({ message: data.resultMessage, severity: 'error' });
        return;
      }

      setRows(data.result.resultList);
      setResultCnt(data.result.resultCnt ?? 0);

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

  const isCompleteDate = (value?: string) => {
    if (!value) {
      return false;
    }

    return /^\d{4}-\d{2}-\d{2}$/.test(value) && dayjs(value, 'YYYY-MM-DD', true).isValid();
  };

  const handleSearchChange = (name: string, value: string) => {
    setSearch((prev) => {
      const next = { ...prev, [name]: value };

      if (name === 'dateFrom' && isCompleteDate(value) && isCompleteDate(next.dateTo) && dayjs(value).isAfter(dayjs(next.dateTo), 'day')) {
        next.dateTo = value;
        showToast({
          message: '계획 생성일 시작이 종료일보다 늦어 종료일을 같은 날짜로 맞췄습니다.',
          severity: 'warning',
        });
      }

      if (name === 'dateTo' && isCompleteDate(value) && isCompleteDate(next.dateFrom) && dayjs(value).isBefore(dayjs(next.dateFrom), 'day')) {
        next.dateFrom = value;
        showToast({
          message: '계획 생성일 종료가 시작일보다 빨라 시작일을 같은 날짜로 맞췄습니다.',
          severity: 'warning',
        });
      }

      if (name === 'prodFrom' && isCompleteDate(value) && isCompleteDate(next.prodTo) && dayjs(value).isAfter(dayjs(next.prodTo), 'day')) {
        next.prodTo = value;
        showToast({
          message: '생산 시작일 시작이 종료일보다 늦어 종료일을 같은 날짜로 맞췄습니다.',
          severity: 'warning',
        });
      }

      if (name === 'prodTo' && isCompleteDate(value) && isCompleteDate(next.prodFrom) && dayjs(value).isBefore(dayjs(next.prodFrom), 'day')) {
        next.prodFrom = value;
        showToast({
          message: '생산 시작일 종료가 시작일보다 빨라 시작일을 같은 날짜로 맞췄습니다.',
          severity: 'warning',
        });
      }

      return next;
    });
  };

  const validateDateRange = () => {
    if (search.dateFrom && search.dateTo && dayjs(search.dateFrom).isAfter(dayjs(search.dateTo), 'day')) {
      showToast({
        message: '계획 생성일 시작은 종료일보다 늦을 수 없습니다.',
        severity: 'error',
      });
      return false;
    }

    if (search.prodFrom && search.prodTo && dayjs(search.prodFrom).isAfter(dayjs(search.prodTo), 'day')) {
      showToast({
        message: '생산 시작일 시작은 종료일보다 늦을 수 없습니다.',
        severity: 'error',
      });
      return false;
    }

    return true;
  };

  const handleSearch = () => {
    if (!validateDateRange()) {
      return;
    }

    setPaginationModel((p) => ({ ...p, page: 0 }));
    setSearchTrigger((t) => t + 1);
  };

  useEffect(() => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(search));
  }, [search]);

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
