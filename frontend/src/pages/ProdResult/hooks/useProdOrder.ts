import { useEffect, useState } from 'react';
import {GridPaginationModel} from "@mui/x-data-grid";
import dayjs from 'dayjs';
import { productionResultService } from '../../../services/productionResultService';
import { useToast } from '../../../components/common/Feedback/ToastProvider';
import {
  ProdResultOrderRow,
  ProductionResultSearchForm,
} from '../../../types/productionResult';

export function useProdOrder() {
  const { showToast } = useToast();

  // 검색 조건
  const today = new Date().toISOString().slice(0, 10);
  const dateTo = new Date();
  dateTo.setDate(dateTo.getDate() + 7);
  const dateToStr = dateTo.toISOString().slice(0, 10);

  // 화면 입력용 검색 조건
  const [search, setSearch] = useState<ProductionResultSearchForm>({
    dateFrom: today,
    dateTo: dateToStr,
    workplace: '',
    equipment: '',
    keyword: '',
  });

  /**
   * 실제 API 호출에 사용하는 검색 파라미터
   * - 검색 버튼 클릭 시에만 세팅됨
   * - 자동 조회 방지 목적
   */
  const [searchParams, setSearchParams] = useState<ProductionResultSearchForm | null>(null);

  /** 페이징 */
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 20,
  });
  const [filter, setFilter] = useState<any>({});

  // 데이터 상태
  const [rows, setRows] = useState<ProdResultOrderRow[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [loading, setLoading] = useState(false);


  /** ======================
   *  데이터그리드 필터링
   *  ====================== */
  const onFilterChange = (model: any) => {
    const item = model.items?.[0];

    let nextFilter: any = {};

    if (item?.field === 'lotNo' && item?.value) {
      nextFilter.lotNo = item.value;
    }

    setFilter(nextFilter);

    // 필터 변경 시 첫 페이지로
    setPaginationModel((prev) => ({
      ...prev,
      page: 0,
    }));
  };


  /** ======================
   *  생산지시 목록 조회 API
   *  ====================== */
  const fetchList = async () => {
    setLoading(true);
    try {
      const params = {
        ...searchParams,
        ...filter,
        page: paginationModel.page,
        size: paginationModel.pageSize,
      };
      const response = await productionResultService.getProdOrders(params);

      const list = response.result?.resultList ?? [];

      // 숫자 필드 정규화
      const rows = list.map((r: any) => ({
        ...r,
        PROD_QTY: Number(r.PROD_QTY ?? 0),
      }));

      setRows(rows);
      setRowCount(response.result?.resultCnt ?? 0);
    } catch (_err: any) {
      showToast({
        message: '생산실적 목록 조회 실패',
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
          message: '시작일이 종료일보다 늦어 종료일을 같은 날짜로 맞췄습니다.',
          severity: 'warning',
        });
      }

      if (name === 'dateTo' && isCompleteDate(value) && isCompleteDate(next.dateFrom) && dayjs(value).isBefore(dayjs(next.dateFrom), 'day')) {
        next.dateFrom = value;
        showToast({
          message: '종료일이 시작일보다 빨라 시작일을 같은 날짜로 맞췄습니다.',
          severity: 'warning',
        });
      }

      return next;
    });
  };

  const validateDateRange = () => {
    if (search.dateFrom && search.dateTo && dayjs(search.dateFrom).isAfter(dayjs(search.dateTo), 'day')) {
      showToast({
        message: '시작일은 종료일보다 늦을 수 없습니다.',
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

    setLoading(true);
    const toYYYYMMDD = (v: string) => v.replaceAll('-', '');
    const model = { ...paginationModel, page: 0 };

    setSearchParams({
      ...search,
      dateFrom: toYYYYMMDD(search.dateFrom!),
      dateTo: toYYYYMMDD(search.dateTo!),
    });
    setPaginationModel(model);
  };


  /** ======================
   *  조회 트리거
   *  - 검색 실행
   *  - 페이지 변경
   *  - 페이지 사이즈 변경
   *  ====================== */
  useEffect(() => {
    if (!searchParams) return;
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginationModel, searchParams]);

  return {
    search,
    setSearch,
    setSearchParams,
    handleSearchChange,
    handleSearch,

    // 결과
    rows,
    rowCount,
    loading,

    // 페이징
    paginationModel,
    onPaginationChange,
    onFilterChange,
  };
}
