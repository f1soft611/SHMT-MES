import React, { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  Button,
  Paper,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useQuery } from '@tanstack/react-query';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, GridReadyEvent, GridApi } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-material.css';
import '../../styles/agGrid.css';
import { interfaceLogService } from '../../services/interfaceLogService';
import InterfaceLogDetailModal from '../../components/Interface/InterfaceLogDetailModal';
import ProtectedRoute from '../../components/auth/ProtectedRoute';

const InterfaceMonitor: React.FC = () => {
  const [rowsPerPage] = useState(10);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedLogNo, setSelectedLogNo] = useState<number | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [gridApi, setGridApi] = useState<GridApi | null>(null);

  const {
    data: interfaceLogsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['interfaceLogs', rowsPerPage, searchKeyword],
    queryFn: () =>
      interfaceLogService.getInterfaceLogs(0, rowsPerPage, searchKeyword),
    staleTime: 5 * 60 * 1000, // 5분
  });

  const { data: interfaceLogDetail } = useQuery({
    queryKey: ['interfaceLogDetail', selectedLogNo],
    queryFn: () => interfaceLogService.getInterfaceLogDetail(selectedLogNo!),
    enabled: !!selectedLogNo && detailModalOpen,
    staleTime: 5 * 60 * 1000, // 5분
  });

  const onGridReady = useCallback((params: GridReadyEvent) => {
    setGridApi(params.api);
  }, []);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchKeyword(value);
    
    // Apply quick filter to AG Grid
    if (gridApi) {
      gridApi.setGridOption('quickFilterText', value);
    }
  };

  const handleDetailClick = (logNo: number) => {
    setSelectedLogNo(logNo);
    setDetailModalOpen(true);
  };

  const handleDetailModalClose = () => {
    setDetailModalOpen(false);
    setSelectedLogNo(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'success';
      case 'FAILED':
        return 'error';
      case 'PENDING':
        return 'warning';
      default:
        return 'default';
    }
  };

  const formatDateTime = (dateTimeStr: string) => {
    if (!dateTimeStr) return '-';
    if (dateTimeStr.length === 14) {
      // YYYYMMDDHHMMSS 형식
      const year = dateTimeStr.substr(0, 4);
      const month = dateTimeStr.substr(4, 2);
      const day = dateTimeStr.substr(6, 2);
      const hour = dateTimeStr.substr(8, 2);
      const minute = dateTimeStr.substr(10, 2);
      const second = dateTimeStr.substr(12, 2);
      return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
    }
    return dateTimeStr;
  };

  // Status 칩 렌더링 컴포넌트
  const StatusRenderer = useCallback((props: any) => {
    const status = props.value;
    return (
      <Chip
        label={status}
        color={getStatusColor(status) as any}
        size="small"
        sx={{ minWidth: 80 }}
      />
    );
  }, []);

  // 상세보기 버튼 렌더링 컴포넌트
  const ActionRenderer = useCallback((props: any) => {
    return (
      <Button
        variant="outlined"
        size="small"
        startIcon={<VisibilityIcon />}
        onClick={() => handleDetailClick(props.data.logNo)}
        sx={{ minWidth: 100 }}
      >
        상세보기
      </Button>
    );
  }, []);

  // AG Grid 컬럼 정의
  const columnDefs: ColDef[] = useMemo(() => [
    {
      headerName: '로그번호',
      field: 'logNo',
      width: 120,
      cellStyle: { textAlign: 'center' },
      headerClass: 'ag-header-cell-centered'
    },
    {
      headerName: '인터페이스명',
      field: 'interfaceName',
      width: 200,
      cellStyle: { textAlign: 'center' },
      headerClass: 'ag-header-cell-centered'
    },
    {
      headerName: '시작시간',
      field: 'startTime',
      width: 180,
      cellStyle: { textAlign: 'center' },
      headerClass: 'ag-header-cell-centered',
      valueFormatter: (params) => formatDateTime(params.value)
    },
    {
      headerName: '종료시간',
      field: 'endTime',
      width: 180,
      cellStyle: { textAlign: 'center' },
      headerClass: 'ag-header-cell-centered',
      valueFormatter: (params) => formatDateTime(params.value)
    },
    {
      headerName: '결과상태',
      field: 'resultStatus',
      width: 140,
      cellStyle: { textAlign: 'center' },
      headerClass: 'ag-header-cell-centered',
      cellRenderer: StatusRenderer
    },
    {
      headerName: '상세보기',
      field: 'action',
      width: 140,
      cellStyle: { textAlign: 'center' },
      headerClass: 'ag-header-cell-centered',
      cellRenderer: ActionRenderer,
      sortable: false,
      filter: false
    }
  ], [ActionRenderer, StatusRenderer]);

  // AG Grid 기본 설정
  const defaultColDef = useMemo(() => ({
    sortable: true,
    filter: true,
    resizable: true,
    minWidth: 100
  }), []);

  return (
    <ProtectedRoute requiredPermission="write">
      <Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h5">인터페이스 로그 모니터링</Typography>
          </Box>
        </Box>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <TextField
                placeholder="검색어를 입력하세요"
                value={searchKeyword}
                onChange={handleSearchChange}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ width: 300 }}
              />
              <Box>
                <Chip
                  icon={<RefreshIcon />}
                  label="새로고침"
                  onClick={() => refetch()}
                  color="primary"
                  variant="outlined"
                  clickable
                />
              </Box>
            </Box>
          </CardContent>
        </Card>

        {isLoading && (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            데이터를 불러오는 중 오류가 발생했습니다.
          </Alert>
        )}

        {interfaceLogsData && !isLoading && (
          <Paper sx={{ height: 600, width: '100%' }}>
            <div 
              className="ag-theme-material" 
              style={{ 
                height: '100%', 
                width: '100%',
              }}
            >
              <AgGridReact
                rowData={interfaceLogsData.content}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                onGridReady={onGridReady}
                pagination={true}
                paginationPageSize={rowsPerPage}
                paginationPageSizeSelector={[5, 10, 25, 50]}
                rowHeight={60}
                headerHeight={50}
                animateRows={true}
                suppressCellFocus={true}
                overlayNoRowsTemplate={
                  '<div style="padding: 20px; text-align: center; color: #666;">데이터가 없습니다.</div>'
                }
                localeText={{
                  // 페이지네이션 한글화
                  page: '페이지',
                  more: '더보기',
                  to: '~',
                  of: '/',
                  next: '다음',
                  last: '마지막',
                  first: '처음',
                  previous: '이전',
                  loadingOoo: '데이터 로딩중...',
                  // 필터링 한글화
                  searchOoo: '검색...',
                  blanks: '공백',
                  filterOoo: '필터...',
                  applyFilter: '필터 적용',
                  clearFilter: '필터 지우기',
                  resetFilter: '필터 초기화',
                  // 정렬 한글화
                  sortAscending: '오름차순 정렬',
                  sortDescending: '내림차순 정렬',
                  sortUnSort: '정렬 해제'
                }}
              />
            </div>
          </Paper>
        )}

        {/* Detail Modal */}
        <InterfaceLogDetailModal
          open={detailModalOpen}
          onClose={handleDetailModalClose}
          interfaceLog={interfaceLogDetail}
        />
      </Box>
    </ProtectedRoute>
  );
};

export default InterfaceMonitor;
