import { useEffect, useState } from 'react';
import { productionResultService } from '../../../services/productionResultService';
import { useToast } from '../../../components/common/Feedback/ToastProvider';
import { ProductionResultOrder } from '../../../types/productionResult';

export function useProdOrder() {
  const { showToast } = useToast();

  // 검색 조건
  const today = new Date().toISOString().slice(0, 10);
  const dateFrom = new Date();
  dateFrom.setDate(dateFrom.getDate() - 7);

  // 입력용 검색조건
  const [search, setSearch] = useState({
    workplace: '',
    equipment: '',
    dateFrom: dateFrom.toISOString().slice(0, 10),
    dateTo: today,
    keyword: '', //통합검색
  });

  // 실제 검색용 파라미터
  const [searchParams, setSearchParams] = useState<typeof search | null>(null);

  // 테이블 페이징
  const [pagination, setPagination] = useState({
    page: 0,
    pageSize: 20,
  });

  // 데이터 상태
  const [rows, setRows] = useState<ProductionResultOrder[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // API 호출
  const fetchList = async () => {
    setLoading(true);
    try {
      const params = {
        ...searchParams,
        page: pagination.page,
        size: pagination.pageSize,
      };
      const response = await productionResultService.getProdOrders(params);
      setRows(response.result?.resultList ?? []);
      setRowCount(response.result?.totalCount ?? 0);
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

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const handlePageSizeChange = (pageSize: number) => {
    setPagination({ page: 0, pageSize });
  };

  const handleSearchChange = (name: string, value: string) => {
    setSearch((prev) => ({ ...prev, [name]: value }));
  };

  // 검색 버튼
  const handleSearch = () => {
    setLoading(true);
    const toYYYYMMDD = (v: string) => v.replaceAll('-', '');
    setSearchParams({
      ...search,
      dateFrom: toYYYYMMDD(search.dateFrom),
      dateTo: toYYYYMMDD(search.dateTo),
    });
    setPagination((prev) => ({ ...prev, page: 0 })); // 검색 시 첫 페이지로
  };

  // 페이지 변경 시 + 검색버튼 누를 시 자동 fetch
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

    rows,
    rowCount,
    loading,

    pagination,
    setPagination,
    handlePageChange,
    handlePageSizeChange,
  };
}
