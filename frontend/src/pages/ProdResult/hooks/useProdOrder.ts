import { useEffect, useState } from 'react';
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
  const dateFrom = new Date();
  dateFrom.setDate(dateFrom.getDate() - 7);

  // 화면 입력용 검색 조건
  const [search, setSearch] = useState<ProductionResultSearchForm>({
    dateFrom: dateFrom.toISOString().slice(0, 10),
    dateTo: today,
    workplace: '',
    equipment: '',
    keyword: '', //통합검색
  });

  /**
   * 실제 API 호출에 사용하는 검색 파라미터
   * - 검색 버튼 클릭 시에만 세팅됨
   * - 자동 조회 방지 목적
   */
  const [searchParams, setSearchParams] = useState<ProductionResultSearchForm | null>(null);

  // 페이징
  const [pagination, setPagination] = useState({
    page: 0,
    pageSize: 20,
  });

  // 데이터 상태
  const [rows, setRows] = useState<ProdResultOrderRow[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [loading, setLoading] = useState(false);


  /** ======================
   *  생산지시 목록 조회 API
   *  ====================== */
  const fetchList = async () => {
    setLoading(true);
    try {
      const params = {
        ...searchParams,
        page: pagination.page,
        size: pagination.pageSize,
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
    } catch (err: any) {
      showToast({
        message: '생산지시 목록 조회 실패',
        severity: 'error',
      });
      setRows([]);
      setRowCount(0);
    } finally {
      setLoading(false);
    }
  };

  /** ======================
   *  페이지 변경
   *  ====================== */
  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  /** ======================
   *  페이지 사이즈 변경
   *  ====================== */
  const handlePageSizeChange = (pageSize: number) => {
    setPagination({ page: 0, pageSize });
  };

  /** ======================
   *  검색 조건 변경
   *  ====================== */
  const handleSearchChange = (name: string, value: string) => {
    setSearch((prev) => ({ ...prev, [name]: value }));
  };

  /** ======================
   *  검색 버튼 클릭
   *  - 날짜 포맷 변환 (YYYY-MM-DD → YYYYMMDD)
   *  - 검색 파라미터 확정
   *  - 페이지 초기화
   *  ====================== */
  const handleSearch = () => {
    setLoading(true);
    const toYYYYMMDD = (v: string) => v.replaceAll('-', '');
    setSearchParams({
      ...search,
      dateFrom: toYYYYMMDD(search.dateFrom!),
      dateTo: toYYYYMMDD(search.dateTo!),
    });
    setPagination((prev) => ({ ...prev, page: 0 })); // 검색 시 첫 페이지로
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
  }, [pagination.page, pagination.pageSize, searchParams]);

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
    pagination,
    setPagination,
    handlePageChange,
    handlePageSizeChange,
  };
}
