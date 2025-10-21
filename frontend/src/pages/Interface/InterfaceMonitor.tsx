import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  Button,
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridPaginationModel,
  GridRowParams,
  GridCellEditStopParams,
  GridRowModel,
} from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useQuery } from '@tanstack/react-query';
import { interfaceLogService } from '../../services/interfaceLogService';
import InterfaceLogDetailModal from '../../components/Interface/InterfaceLogDetailModal';
import ProtectedRoute from '../../components/auth/ProtectedRoute';

const InterfaceMonitor: React.FC = () => {
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedLogNo, setSelectedLogNo] = useState<number | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const {
    data: interfaceLogsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      'interfaceLogs',
      paginationModel.page,
      paginationModel.pageSize,
      searchKeyword,
    ],
    queryFn: () =>
      interfaceLogService.getInterfaceLogs(
        paginationModel.page,
        paginationModel.pageSize,
        searchKeyword
      ),
    staleTime: 5 * 60 * 1000, // 5분
  });

  const { data: interfaceLogDetail } = useQuery({
    queryKey: ['interfaceLogDetail', selectedLogNo],
    queryFn: () => interfaceLogService.getInterfaceLogDetail(selectedLogNo!),
    enabled: !!selectedLogNo && detailModalOpen,
    staleTime: 5 * 60 * 1000, // 5분
  });

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(event.target.value);
    setPaginationModel({ ...paginationModel, page: 0 });
  };

  const handleDetailClick = (logNo: number) => {
    setSelectedLogNo(logNo);
    setDetailModalOpen(true);
  };

  const handleDetailModalClose = () => {
    setDetailModalOpen(false);
    setSelectedLogNo(null);
  };

  // 셀 편집 완료 시 호출되는 함수
  const handleProcessRowUpdate = (newRow: GridRowModel) => {
    console.log('업데이트된 행 데이터:', newRow);
    return newRow;
  };

  // 편집 에러 처리
  const handleProcessRowUpdateError = (error: Error) => {
    console.error('행 업데이트 중 오류 발생:', error);
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

  const columns: GridColDef[] = [
    {
      field: 'logNo',
      headerName: '로그번호',
      flex: 0.8,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'interfaceName',
      headerName: '인터페이스명',
      flex: 1,
      align: 'center',
      headerAlign: 'center',
      editable: true, // 추가
      renderEditCell: (
        params // 추가
      ) => (
        <TextField
          value={params.value}
          onChange={(e) =>
            params.api.setEditCellValue({
              id: params.id,
              field: params.field,
              value: e.target.value,
            })
          }
          size="small"
          fullWidth
          autoFocus // 추가: 자동 포커스
          variant="standard" // 변경: outlined → standard (보더 제거)
          placeholder="인터페이스명을 입력하세요"
          InputProps={{
            disableUnderline: true, // 추가: 밑줄 제거
          }}
          sx={{
            '& .MuiInputBase-input': {
              padding: '8px 16px', // 셀과 동일한 패딩
              textAlign: 'center', // 중앙 정렬 유지
            },
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              params.api.stopCellEditMode({
                id: params.id,
                field: params.field,
              });
            }
            if (e.key === 'Escape') {
              params.api.stopCellEditMode({
                id: params.id,
                field: params.field,
                ignoreModifications: true,
              });
            }
          }}
        />
      ),
    },
    {
      field: 'startTime',
      headerName: '시작시간',
      flex: 1.5,
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (value) => formatDateTime(value),
    },
    {
      field: 'endTime',
      headerName: '종료시간',
      flex: 1.5,
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (value) => formatDateTime(value),
    },
    {
      field: 'resultStatus',
      headerName: '결과상태',
      flex: 1,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={getStatusColor(params.value) as any}
          size="small"
        />
      ),
    },
    {
      field: 'actions',
      headerName: '상세보기',
      flex: 1,
      align: 'center',
      headerAlign: 'center',
      sortable: false,
      renderCell: (params) => (
        <Button
          variant="outlined"
          size="small"
          startIcon={<VisibilityIcon />}
          onClick={() => handleDetailClick(params.row.logNo)}
        >
          상세보기
        </Button>
      ),
    },
  ];

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
          <Paper sx={{ height: '100%', width: '100%' }}>
            <DataGrid
              rows={interfaceLogsData.content}
              columns={columns}
              getRowId={(row) => row.logNo}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              pageSizeOptions={[5, 10, 25, 50]}
              rowCount={interfaceLogsData.totalElements}
              paginationMode="server"
              loading={isLoading}
              disableRowSelectionOnClick
              processRowUpdate={handleProcessRowUpdate} // 추가
              onProcessRowUpdateError={handleProcessRowUpdateError} // 추가
              sx={{
                border: 'none',
                flex: 1,
                '& .MuiDataGrid-cell:focus': {
                  outline: 'none',
                },
                '& .MuiDataGrid-row:hover': {
                  backgroundColor: 'action.hover',
                },
                '& .MuiDataGrid-cell--editable': {
                  backgroundColor: 'rgba(0, 123, 255, 0.04)',
                },
                '& .MuiDataGrid-cell--editing': {
                  backgroundColor: 'rgba(255, 193, 7, 0.1)',
                  border: 'none !important', // 추가: 편집 중 보더 제거
                },
              }}
              localeText={{
                noRowsLabel: '데이터가 없습니다',
                footerRowSelected: (count) => `${count}개 선택됨`,
              }}
              slotProps={{
                pagination: {
                  labelRowsPerPage: '페이지당 행 수:',
                  labelDisplayedRows: ({
                    from,
                    to,
                    count,
                  }: {
                    from: number;
                    to: number;
                    count: number;
                  }) =>
                    `${from}-${to} / ${count !== -1 ? count : `${to} 이상`}`,
                },
              }}
            />
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
