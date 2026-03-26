import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import { GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import stockInquiryService, {
  StockInquiry,
  StockInquirySearchParams,
} from '../../services/stockInquiryService';
import { useToast } from '../../components/common/Feedback/ToastProvider';
import { getServerDate } from '../../utils/dateUtils';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import PageHeader from '../../components/common/PageHeader/PageHeader';
import DataTable from '../../components/common/DataTable/DataTable';

const StockInquiryPage: React.FC = () => {
  const { showToast } = useToast();

  // 날짜 포맷 함수 (YYYY-MM-DD)
  const formatDateToString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 오늘 날짜 (서버 시간 기준)
  const today = getServerDate();
  const todayStr = formatDateToString(today);

  // 한달 전 날짜 (서버 시간 기준)
  const oneMonthAgo = new Date(today);
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  const oneMonthAgoStr = formatDateToString(oneMonthAgo);

  // 상태 관리
  const [stockList, setStockList] = useState<StockInquiry[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // 검색 조건
  const [searchParams, setSearchParams] = useState<StockInquirySearchParams>({
    dateFr: oneMonthAgoStr,
    dateTo: todayStr,
    itemNo: '',
    itemName: '',
    whName: '',
  });

  // 페이징 상태
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 20,
  });

  // 재고 조회 (params를 직접 받아 stale closure 방지)
  const fetchStockListWithParams = async (
    params: StockInquirySearchParams,
    pagination: GridPaginationModel,
  ) => {
    if (!params.dateFr || !params.dateTo) {
      showToast({ message: '조회 기간을 입력해주세요.', severity: 'warning' });
      return;
    }

    setLoading(true);
    try {
      // 날짜 형식 변환: YYYY-MM-DD -> YYYYMMDD
      const dateFr = params.dateFr.replace(/-/g, '');
      const dateTo = params.dateTo.replace(/-/g, '');

      const response = await stockInquiryService.getStockList({
        ...params,
        dateFr,
        dateTo,
        pageIndex: pagination.page + 1,
        pageSize: pagination.pageSize,
      });

      if (response.resultCode === 200) {
        setStockList(response.result.resultList || []);
        setTotalCount(response.result.totalCount || 0);
      } else {
        showToast({ message: '재고 조회에 실패했습니다.', severity: 'error' });
        setStockList([]);
        setTotalCount(0);
      }
    } catch (error: unknown) {
      console.error('재고 조회 오류:', error);
      const errorMessage =
        error instanceof Error ? error.message : '재고 조회에 실패했습니다.';
      showToast({ message: errorMessage, severity: 'error' });
      setStockList([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  // 페이지/사이즈 변경 시 조회 (초기 로드 포함)
  useEffect(() => {
    fetchStockListWithParams(searchParams, paginationModel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginationModel.page, paginationModel.pageSize]);

  // 검색 처리 — page가 0이 아니면 리셋 후 useEffect에 위임, 이미 0이면 직접 호출
  const handleSearch = () => {
    if (paginationModel.page !== 0) {
      setPaginationModel((prev) => ({ ...prev, page: 0 }));
    } else {
      fetchStockListWithParams(searchParams, paginationModel);
    }
  };

  // 검색 조건 초기화 — 초기값으로 직접 조회 (stale 상태 무관)
  const handleReset = () => {
    const resetParams: StockInquirySearchParams = {
      dateFr: oneMonthAgoStr,
      dateTo: todayStr,
      itemNo: '',
      itemName: '',
      whName: '',
    };
    const resetPagination: GridPaginationModel = { page: 0, pageSize: 20 };
    setSearchParams(resetParams);
    setPaginationModel(resetPagination);
    fetchStockListWithParams(resetParams, resetPagination);
  };

  // 테이블 컴럼 정의
  const columns: GridColDef[] = [
    {
      field: 'rowNum',
      headerName: '번호',
      width: 80,
      align: 'center',
      headerAlign: 'center',
      valueGetter: (value, row, column, apiRef) => {
        const rowIndex = apiRef.current.getRowIndexRelativeToVisibleRows(
          `${row.itemNo}_${row.whName}`,
        );
        return paginationModel.page * paginationModel.pageSize + rowIndex + 1;
      },
    },
    {
      field: 'itemSeq',
      headerName: '품목코드',
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'itemNo',
      headerName: '품번',
      width: 250,
      headerAlign: 'center',
    },
    // {
    //   field: 'itemName',
    //   headerName: '품명',
    //   width: 200,
    //   align: 'center',
    //   headerAlign: 'center',
    // },
    {
      field: 'whSeq',
      headerName: '창고코드',
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'whName',
      headerName: '창고명',
      width: 150,
      // align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'stockQty',
      headerName: '재고수량',
      width: 120,
      align: 'right',
      headerAlign: 'center',
      valueFormatter: (value: number) => value?.toLocaleString('ko-KR') || '0',
    },
    // {
    //   field: 'unit',
    //   headerName: '단위',
    //   width: 100,
    //   align: 'center',
    //   headerAlign: 'center',
    //   renderCell: (params) => params.value || '-',
    // },
  ];

  return (
    <ProtectedRoute requiredPermission="read">
      <Box sx={{ width: '100%', height: '100%' }}>
        <PageHeader
          title=""
          crumbs={[{ label: '생산 관리' }, { label: '재고 관리' }]}
        />

        {/* 검색 영역 (기준정보 패턴 통일) */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography
            variant="h6"
            sx={{
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              fontWeight: 600,
              fontSize: '1rem',
            }}
          >
            <FilterListIcon color="primary" />
            검색 필터
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              label="시작 일자"
              size="small"
              type="date"
              value={searchParams.dateFr}
              onChange={(e) =>
                setSearchParams({
                  ...searchParams,
                  dateFr: e.target.value,
                })
              }
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 160 }}
            />

            <TextField
              label="종료 일자"
              size="small"
              type="date"
              value={searchParams.dateTo}
              onChange={(e) =>
                setSearchParams({
                  ...searchParams,
                  dateTo: e.target.value,
                })
              }
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 160 }}
            />

            <TextField
              size="small"
              label="품번"
              value={searchParams.itemNo}
              onChange={(e) =>
                setSearchParams({
                  ...searchParams,
                  itemNo: e.target.value,
                })
              }
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              sx={{ flex: 1, minWidth: 240 }}
            />

            <Button variant="outlined" onClick={handleReset}>
              초기화
            </Button>
            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={handleSearch}
            >
              검색
            </Button>
          </Stack>
        </Paper>

        <Paper sx={{ height: 'calc(100vh - 380px)', width: '100%' }}>
          <DataTable
            rows={stockList}
            columns={columns}
            loading={loading}
            getRowId={(row) => `${row.itemNo}_${row.whName}`}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            rowCount={totalCount}
            pageSizeOptions={[20, 50, 100]}
          />
        </Paper>
      </Box>
    </ProtectedRoute>
  );
};

export default StockInquiryPage;
