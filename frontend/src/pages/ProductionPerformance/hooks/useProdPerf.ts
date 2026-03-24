import { useEffect, useState } from 'react';
import { GridPaginationModel } from '@mui/x-data-grid';
import {
  ProdPerfRow,
  ProdPerfSearchParams,
} from '../../../types/productionPerformance';
import { useToast } from '../../../components/common/Feedback/ToastProvider';
import { useFetchWorkplaces } from '../../../hooks/useFetchWorkplaces';
import { useFetchEquipments } from '../../../hooks/useFetchEquipments';
import { productionPerformanceService } from '../../../services/productionPerformanceService';

const PROD_PERF_SEARCH_SESSION_KEY = 'productionPerformance.search';

const getDefaultSearch = (): ProdPerfSearchParams => {
  const today = new Date().toISOString().slice(0, 10);
  const dateTo = new Date();
  dateTo.setDate(dateTo.getDate() + 7);

  return {
    workplace: '',
    equipment: '',
    dateFrom: today,
    dateTo: dateTo.toISOString().slice(0, 10),
    completeFrom: '',
    completeTo: '',
  };
};

const getInitialSearch = (): ProdPerfSearchParams => {
  const defaultSearch = getDefaultSearch();

  try {
    const savedSearch = sessionStorage.getItem(PROD_PERF_SEARCH_SESSION_KEY);
    if (!savedSearch) {
      return defaultSearch;
    }

    const parsed = JSON.parse(savedSearch);
    if (!parsed || typeof parsed !== 'object') {
      return defaultSearch;
    }

    return {
      ...defaultSearch,
      workplace:
        typeof parsed.workplace === 'string'
          ? parsed.workplace
          : defaultSearch.workplace,
      equipment:
        typeof parsed.equipment === 'string'
          ? parsed.equipment
          : defaultSearch.equipment,
      dateFrom:
        typeof parsed.dateFrom === 'string'
          ? parsed.dateFrom
          : defaultSearch.dateFrom,
      dateTo:
        typeof parsed.dateTo === 'string'
          ? parsed.dateTo
          : defaultSearch.dateTo,
      completeFrom:
        typeof parsed.completeFrom === 'string'
          ? parsed.completeFrom
          : defaultSearch.completeFrom,
      completeTo:
        typeof parsed.completeTo === 'string'
          ? parsed.completeTo
          : defaultSearch.completeTo,
    };
  } catch {
    return defaultSearch;
  }
};

export function useProdPerf() {
  const { showToast } = useToast();

  /** 검색조건 */
  const [search, setSearch] = useState<ProdPerfSearchParams>(() =>
    getInitialSearch(),
  );

  /** 페이징 */
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 20,
  });

  /** 리스트 */
  const [rows, setRows] = useState<ProdPerfRow[]>([]);
  const [rowCount, setRowCount] = useState(0);

  /** 로딩 */
  const [loading, setLoading] = useState(false);

  /** 검색조건 변경 */
  const onChange = (name: keyof ProdPerfSearchParams, value: string) => {
    setSearch((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onSearch = async (model = paginationModel) => {
    try {
      setLoading(true);
      const params = {
        ...search,
        page: model.page,
        size: model.pageSize,
      };

      const response =
        await productionPerformanceService.getProdPerfList(params);
      setRows(response.result?.resultList ?? []);
      setRowCount(response.result.resultCnt ?? 0);
    } catch (err: any) {
      showToast({
        message: '목록 조회 실패',
        severity: 'error',
      });
      setRows([]);
      setRowCount(0);
    } finally {
      setLoading(false);
    }
  };

  const onPaginationChange = (model: GridPaginationModel) => {
    setPaginationModel(model);
    onSearch(model);
  };

  useEffect(() => {
    try {
      sessionStorage.setItem(
        PROD_PERF_SEARCH_SESSION_KEY,
        JSON.stringify(search),
      );
    } catch {
      // ignore storage errors
    }
  }, [search]);

  // 작업장 조회
  const workplaces = useFetchWorkplaces();
  //  작업장 코드 기준 설비 자동 조회
  const { equipments } = useFetchEquipments(search.workplace);

  return {
    rows,
    rowCount,
    loading,
    search,
    onChange,
    onSearch,
    workplaces: workplaces.workplaces,
    equipments,
    paginationModel,
    onPaginationChange,
  };
}
