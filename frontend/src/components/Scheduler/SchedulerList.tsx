import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  Chip,
  Tooltip,
  Alert,
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridPaginationModel,
  GridActionsCellItem,
} from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { schedulerService } from '../../services/schedulerService';

interface SchedulerListProps {
  onEdit: (schedulerId: number) => void;
}

const SchedulerList: React.FC<SchedulerListProps> = ({ onEdit }) => {
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [searchKeyword, setSearchKeyword] = useState('');
  const [alertMessage, setAlertMessage] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // 마지막 정상 응답의 rows/total을 저장
  const lastRowsRef = useRef<any[]>([]);
  const lastTotalRef = useRef<number>(0);

  const queryClient = useQueryClient();

  // 검색 변경 시 페이지 강제 리셋
  useEffect(() => {
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  }, [searchKeyword]);

  const {
    data: schedulersData,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      'schedulers',
      paginationModel.page,
      paginationModel.pageSize,
      searchKeyword,
    ],
    queryFn: ({ queryKey }) => {
      const [, page, pageSize, keyword] = queryKey as any;

      const pageForApi = typeof page === 'number' ? page : page;

      return schedulerService.getSchedulerList(pageForApi, pageSize, keyword);
    },
    // keepPreviousData 사용하지 않음
    staleTime: 30 * 1000, // 30초 동안 데이터 신선하게 유지
  });

  // 정상적으로 데이터가 들어오면 lastRefs 업데이트
  useEffect(() => {
    const rows = schedulersData?.result?.resultList;
    const cnt = schedulersData?.result?.resultCnt
      ? parseInt(schedulersData.result.resultCnt, 10)
      : undefined;

    if (Array.isArray(rows) && rows.length >= 0) {
      lastRowsRef.current = rows;
    }
    if (typeof cnt === 'number' && !Number.isNaN(cnt)) {
      lastTotalRef.current = cnt;
    }
  }, [schedulersData]);

  const deleteMutation = useMutation({
    mutationFn: (schedulerId: number) =>
      schedulerService.deleteScheduler(schedulerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedulers'] });
      setAlertMessage({
        type: 'success',
        message: '스케쥴러가 삭제되었습니다.',
      });
      setTimeout(() => setAlertMessage(null), 3000);
    },
    onError: (error: any) => {
      setAlertMessage({
        type: 'error',
        message: `삭제 실패: ${error.message}`,
      });
      setTimeout(() => setAlertMessage(null), 5000);
    },
  });

  const executeMutation = useMutation({
    mutationFn: (schedulerId: number) =>
      schedulerService.executeScheduler(schedulerId),
    onSuccess: () => {
      setAlertMessage({
        type: 'success',
        message: '스케쥴러가 실행되었습니다.',
      });
      setTimeout(() => setAlertMessage(null), 3000);
    },
    onError: (error: any) => {
      setAlertMessage({
        type: 'error',
        message: `실행 실패: ${error.message}`,
      });
      setTimeout(() => setAlertMessage(null), 5000);
    },
  });

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(event.target.value);
  };

  const handleDeleteClick = (schedulerId: number) => {
    if (window.confirm('이 스케쥴러를 삭제하시겠습니까?')) {
      deleteMutation.mutate(schedulerId);
    }
  };

  const handleExecuteClick = (schedulerId: number) => {
    if (window.confirm('이 스케쥴러를 즉시 실행하시겠습니까?')) {
      executeMutation.mutate(schedulerId);
    }
  };

  const getStatusColor = (isEnabled: string) => {
    return isEnabled === 'Y' ? 'success' : 'default';
  };

  const getStatusLabel = (isEnabled: string) => {
    return isEnabled === 'Y' ? '활성' : '비활성';
  };

  const columns: GridColDef[] = [
    {
      field: 'schedulerId',
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
      headerAlign: 'center',
    },
    {
      field: 'schedulerDescription',
      headerName: '설명',
      flex: 1,
      minWidth: 250,
      headerAlign: 'center',
    },
    {
      field: 'cronExpression',
      headerName: 'CRON 표현식',
      width: 150,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'isEnabled',
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
      field: 'regDt',
      headerName: '등록일시',
      width: 180,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: '작업',
      width: 150,
      getActions: (params) => [
        <GridActionsCellItem
          icon={
            <Tooltip title="즉시 실행">
              <PlayArrowIcon />
            </Tooltip>
          }
          label="실행"
          onClick={() => handleExecuteClick(params.row.schedulerId)}
        />,
        <GridActionsCellItem
          icon={
            <Tooltip title="수정">
              <EditIcon />
            </Tooltip>
          }
          label="수정"
          onClick={() => onEdit(params.row.schedulerId)}
        />,
        <GridActionsCellItem
          icon={
            <Tooltip title="삭제">
              <DeleteIcon />
            </Tooltip>
          }
          label="삭제"
          onClick={() => handleDeleteClick(params.row.schedulerId)}
        />,
      ],
    },
  ];

  // 로딩 중이면 이전 rows/total을 보여주고, 아니면 실제 데이터 사용
  const rows = isLoading
    ? lastRowsRef.current
    : schedulersData?.result?.resultList || [];
  const totalCount = schedulersData?.result?.resultCnt
    ? parseInt(schedulersData.result.resultCnt, 10)
    : lastTotalRef.current ?? 0;

  if (error) {
    return (
      <Alert severity="error">
        데이터를 불러오는 중 오류가 발생했습니다: {(error as Error).message}
      </Alert>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {alertMessage && (
        <Alert severity={alertMessage.type} sx={{ mb: 2 }}>
          {alertMessage.message}
        </Alert>
      )}

      <Box sx={{ mb: 2, ml: 2 }}>
        <TextField
          size="small"
          placeholder="스케쥴러명 또는 설명으로 검색"
          value={searchKeyword}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ width: 300 }}
        />
      </Box>

      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(row) => row.schedulerId}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[5, 10, 25, 50]}
        rowCount={totalCount}
        paginationMode="server"
        loading={isLoading}
        autoHeight
        disableRowSelectionOnClick
        sx={{
          '& .MuiDataGrid-cell:focus': {
            outline: 'none',
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: 'action.hover',
          },
        }}
      />
    </Box>
  );
};

export default SchedulerList;
