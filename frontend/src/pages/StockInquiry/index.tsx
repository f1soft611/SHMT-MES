import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
  InputAdornment,
} from '@mui/material';
import Grid from '@mui/material/Grid';
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
    pageSize: 10,
  });

  // 재고 조회
  const fetchStockList = async () => {
    if (!searchParams.dateFr || !searchParams.dateTo) {
      showToast({ message: '조회 기간을 입력해주세요.', severity: 'warning' });
      return;
    }

    setLoading(true);
    try {
      // 날짜 형식 변환: YYYY-MM-DD -> YYYYMMDD
      const dateFr = searchParams.dateFr.replace(/-/g, '');
      const dateTo = searchParams.dateTo.replace(/-/g, '');

      const response = await stockInquiryService.getStockList({
        ...searchParams,
        dateFr,
        dateTo,
        pageIndex: paginationModel.page + 1,
        pageSize: paginationModel.pageSize,
      });

      if (response.resultCode === 200) {
        setStockList(response.result.resultList || []);
        setTotalCount(response.result.totalCount || 0);
      } else {
        showToast({ message: '재고 조회에 실패했습니다.', severity: 'error' });
        setStockList([]);
        setTotalCount(0);
      }
    } catch (error: any) {
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

  // 초기 로드 및 페이지 변경 시 조회
  useEffect(() => {
    fetchStockList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginationModel.page, paginationModel.pageSize]);

  // 검색 처리
  const handleSearch = () => {
    setPaginationModel({ ...paginationModel, page: 0 });
    fetchStockList();
  };

  // 검색 조건 초기화
  const handleReset = () => {
    setSearchParams({
      dateFr: oneMonthAgoStr,
      dateTo: todayStr,
      itemNo: '',
      itemName: '',
      whName: '',
    });
    setPaginationModel({ page: 0, pageSize: 10 });
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
          row.itemNo + row.whName,
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
          crumbs={[{ label: '재고 관리' }, { label: '재고조회' }]}
        />

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

          <Grid container spacing={1} sx={{ mb: 2 }}>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <TextField
                fullWidth
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
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <TextField
                fullWidth
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
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <TextField
                fullWidth
                label="품번"
                size="small"
                value={searchParams.itemNo}
                onChange={(e) =>
                  setSearchParams({
                    ...searchParams,
                    itemNo: e.target.value,
                  })
                }
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>

          <Stack direction="row" spacing={2} justifyContent="flex-end">
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
            getRowId={(row) => row.itemNo + row.whName}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            rowCount={totalCount}
          />
        </Paper>
      </Box>
    </ProtectedRoute>
  );
};

export default StockInquiryPage;
