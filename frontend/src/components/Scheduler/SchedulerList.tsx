import React, { useState } from 'react';
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

  const queryClient = useQueryClient();

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
    queryFn: () =>
      schedulerService.getSchedulerList(
        paginationModel.page,
        paginationModel.pageSize,
        searchKeyword
      ),
    staleTime: 5 * 60 * 1000,
  });

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

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(event.target.value);
    setPaginationModel({ ...paginationModel, page: 0 });
  };

  const handleDeleteClick = (schedulerId: number) => {
    if (window.confirm('이 스케쥴러를 삭제하시겠습니까?')) {
      deleteMutation.mutate(schedulerId);
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
    },
    {
      field: 'schedulerDescription',
      headerName: '설명',
      flex: 1,
      minWidth: 250,
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
      width: 120,
      getActions: (params) => [
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

  const rows = schedulersData?.result?.resultList || [];
  const totalCount = schedulersData?.result?.resultCnt
    ? parseInt(schedulersData.result.resultCnt)
    : 0;

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
