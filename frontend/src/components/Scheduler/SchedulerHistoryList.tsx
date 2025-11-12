import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  Chip,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import { useQuery } from '@tanstack/react-query';
import { schedulerService } from '../../services/schedulerService';

const SchedulerHistoryList: React.FC = () => {
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // 마지막 정상 응답의 rows/total을 저장
  const lastRowsRef = useRef<any[]>([]);
  const lastTotalRef = useRef<number>(0);

  // 검색/필터 변경 시 페이지 강제 리셋
  useEffect(() => {
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  }, [searchKeyword, statusFilter]);

  const {
    data: historyData,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      'schedulerHistory',
      paginationModel.page,
      paginationModel.pageSize,
      searchKeyword,
      statusFilter,
    ],
    queryFn: ({ queryKey }) => {
      const [, page, pageSize, keyword, status] = queryKey as any;

      // 백엔드가 1-based 페이지를 기대하면 page + 1 사용
      const pageForApi = typeof page === 'number' ? page : page;

      return schedulerService.getSchedulerHistoryList(
        pageForApi,
        pageSize,
        keyword,
        undefined,
        status
      );
    },
    // keepPreviousData: true,
    staleTime: 30 * 1000, // 30초 동안 데이터 신선하게 유지
  });

  // 정상적으로 데이터가 들어오면 lastRefs 업데이트
  useEffect(() => {
    const rows = historyData?.result?.resultList;
    const cnt = historyData?.result?.resultCnt
      ? parseInt(historyData.result.resultCnt, 10)
      : undefined;

    if (Array.isArray(rows) && rows.length >= 0) {
      lastRowsRef.current = rows;
    }
    if (typeof cnt === 'number' && !Number.isNaN(cnt)) {
      lastTotalRef.current = cnt;
    }
  }, [historyData]);

  // 로딩 중이면 이전 rows/total을 보여주고, 아니면 실제 데이터 사용
  const rowsToShow = isLoading
    ? lastRowsRef.current
    : historyData?.result?.resultList || [];
  const totalCountToShow = historyData?.result?.resultCnt
    ? parseInt(historyData.result.resultCnt, 10)
    : lastTotalRef.current ?? 0;

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(event.target.value);
  };

  const handleStatusChange = (event: any) => {
    setStatusFilter(event.target.value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'success';
      case 'FAILED':
        return 'error';
      case 'RUNNING':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return '성공';
      case 'FAILED':
        return '실패';
      case 'RUNNING':
        return '실행중';
      default:
        return status;
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'historyId',
      headerName: 'ID',
      width: 80,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'schedulerName',
      headerName: '스케쥴러명',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'startTime',
      headerName: '시작시간',
      width: 190,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'endTime',
      headerName: '종료시간',
      width: 190,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'executionTimeMs',
      headerName: '실행시간(ms)',
      width: 130,
      align: 'right',
      headerAlign: 'center',
      renderCell: (params: any) => {
        const value = params.row.executionTimeMs;
        if (value === null || value === undefined || value === '') return '-';

        const numValue = Number(value);
        if (isNaN(numValue)) return '-';

        return numValue.toLocaleString();
      },
    },
    {
      field: 'status',
      headerName: '상태',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={getStatusLabel(params.value)}
          color={getStatusColor(params.value)}
          size="small"
        />
      ),
    },
    {
      field: 'errorMessage',
      headerName: '에러 메시지',
      flex: 1,
      minWidth: 250,
      renderCell: (params) => {
        if (!params.value) return '-';
        return (
          <Box
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={params.value}
          >
            {params.value}
          </Box>
        );
      },
    },
  ];

  if (error) {
    return (
      <Alert severity="error">
        데이터를 불러오는 중 오류가 발생했습니다: {(error as Error).message}
      </Alert>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 2, ml: 2, display: 'flex', gap: 2 }}>
        <TextField
          size="small"
          placeholder="스케쥴러명 또는 에러 메시지로 검색"
          value={searchKeyword}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ width: 350 }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>상태</InputLabel>
          <Select
            value={statusFilter}
            label="상태"
            onChange={handleStatusChange}
          >
            <MenuItem value="">전체</MenuItem>
            <MenuItem value="SUCCESS">성공</MenuItem>
            <MenuItem value="FAILED">실패</MenuItem>
            <MenuItem value="RUNNING">실행중</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <DataGrid
        rows={rowsToShow}
        columns={columns}
        getRowId={(row) => row.historyId}
        paginationModel={paginationModel}
        onPaginationModelChange={(newModel) => {
          setPaginationModel(newModel);
        }}
        pageSizeOptions={[5, 10, 25, 50]}
        rowCount={totalCountToShow}
        paginationMode="server"
        loading={isLoading}
        autoHeight
        disableRowSelectionOnClick
        sx={{
          '& .MuiDataGrid-cell:focus': { outline: 'none' },
          '& .MuiDataGrid-row:hover': { backgroundColor: 'action.hover' },
        }}
      />
    </Box>
  );
};

export default SchedulerHistoryList;
