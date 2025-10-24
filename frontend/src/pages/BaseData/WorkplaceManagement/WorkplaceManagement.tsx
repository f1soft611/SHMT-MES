import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  People as PeopleIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { Workplace, WorkplaceWorker } from '../../../types/workplace';
import workplaceService from '../../../services/workplaceService';

const WorkplaceManagement: React.FC = () => {
  const [workplaces, setWorkplaces] = useState<Workplace[]>([]);
  const [selectedWorkplace, setSelectedWorkplace] = useState<Workplace | null>(
    null
  );
  const [openDialog, setOpenDialog] = useState(false);
  const [openWorkerDialog, setOpenWorkerDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // 폼 상태
  const [formData, setFormData] = useState<Workplace>({
    workplaceCode: '',
    workplaceName: '',
    description: '',
    location: '',
    workplaceType: '',
    status: 'ACTIVE',
    useYn: 'Y',
  });

  // 실제 검색에 사용되는 파라미터
  const [searchParams, setSearchParams] = useState({
    searchCnd: '1',
    searchWrd: '',
    status: '',
  });

  // 입력 필드용 상태 (화면 입력용)
  const [inputValues, setInputValues] = useState({
    searchCnd: '1',
    searchWrd: '',
    status: '',
  });

  // 작업장 목록 조회 (searchParams 의존성으로 자동 실행)
  const fetchWorkplaces = useCallback(async () => {
    try {
      const response = await workplaceService.getWorkplaceList(searchParams);
      if (response.resultCode === 200 && response.result?.resultList) {
        setWorkplaces(response.result.resultList);
      }
    } catch (error) {
      console.error('Failed to fetch workplaces:', error);
      showSnackbar('작업장 목록을 불러오는데 실패했습니다.', 'error');
    }
  }, [searchParams]);

  // 컴포넌트 마운트 시와 searchParams 변경 시에만 조회
  useEffect(() => {
    fetchWorkplaces();
  }, [fetchWorkplaces]);

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // 검색 실행 (입력값을 검색 파라미터로 복사)
  const handleSearch = () => {
    setSearchParams({ ...inputValues });
  };

  // 검색 조건 초기화
  const handleReset = () => {
    const resetValues = {
      searchCnd: '1',
      searchWrd: '',
      status: '',
    };
    setInputValues(resetValues);
    setSearchParams(resetValues);
  };

  // 입력 필드 변경 핸들러
  const handleInputChange = (field: string, value: string) => {
    setInputValues({
      ...inputValues,
      [field]: value,
    });
  };

  const handleOpenCreateDialog = () => {
    setDialogMode('create');
    setFormData({
      workplaceCode: '',
      workplaceName: '',
      description: '',
      location: '',
      workplaceType: '',
      status: 'ACTIVE',
      useYn: 'Y',
    });
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (workplace: Workplace) => {
    setDialogMode('edit');
    setFormData(workplace);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleChange = (field: keyof Workplace, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSave = async () => {
    try {
      if (dialogMode === 'create') {
        const result = await workplaceService.createWorkplace(formData);
        if (result.resultCode === 200) {
          showSnackbar('작업장이 등록되었습니다.', 'success');
        } else {
          showSnackbar(result.result.message, 'error');
        }
      } else {
        await workplaceService.updateWorkplace(formData.workplaceId!, formData);
        showSnackbar('작업장이 수정되었습니다.', 'success');
      }
      handleCloseDialog();
      // 저장 후 현재 검색 조건으로 다시 조회
      fetchWorkplaces();
    } catch (error) {
      console.error('Failed to save workplace:', error);
      showSnackbar('저장에 실패했습니다.', 'error');
    }
  };

  const handleDelete = async (workplaceId: string) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        await workplaceService.deleteWorkplace(workplaceId);
        showSnackbar('작업장이 삭제되었습니다.', 'success');
        // 삭제 후 현재 검색 조건으로 다시 조회
        fetchWorkplaces();
      } catch (error) {
        console.error('Failed to delete workplace:', error);
        showSnackbar('삭제에 실패했습니다.', 'error');
      }
    }
  };

  const handleOpenWorkerDialog = (workplace: Workplace) => {
    setSelectedWorkplace(workplace);
    setOpenWorkerDialog(true);
  };

  const handleCloseWorkerDialog = () => {
    setOpenWorkerDialog(false);
    setSelectedWorkplace(null);
  };

  const getStatusColor = (status: string) => {
    return status === 'ACTIVE' ? 'success' : 'default';
  };

  const getStatusLabel = (status: string) => {
    return status === 'ACTIVE' ? '활성' : '비활성';
  };

  const columns: GridColDef[] = [
    {
      field: 'workplaceCode',
      headerName: '작업장 코드',
      flex: 1,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'workplaceName',
      headerName: '작업장명',
      flex: 1.2,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'location',
      headerName: '위치',
      flex: 1,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'workplaceType',
      headerName: '타입',
      flex: 1,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'status',
      headerName: '상태',
      flex: 0.8,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={getStatusLabel(params.value || 'ACTIVE')}
          color={getStatusColor(params.value || 'ACTIVE') as any}
          size="small"
        />
      ),
    },
    {
      field: 'regDt',
      headerName: '등록일',
      flex: 1.2,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'actions',
      headerName: '관리',
      flex: 1.2,
      align: 'center',
      headerAlign: 'center',
      sortable: false,
      renderCell: (params) => (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
          }}
        >
          <Stack direction="row" spacing={1} justifyContent="center">
            <IconButton
              size="small"
              color="primary"
              onClick={() => handleOpenWorkerDialog(params.row)}
              title="작업자 관리"
            >
              <PeopleIcon />
            </IconButton>
            <IconButton
              size="small"
              color="primary"
              onClick={() => handleOpenEditDialog(params.row)}
              title="수정"
            >
              <EditIcon />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDelete(params.row.workplaceId!)}
              title="삭제"
            >
              <DeleteIcon />
            </IconButton>
          </Stack>
        </Box>
      ),
    },
  ];

  return (
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
          <Typography variant="h5">작업장 관리</Typography>
        </Box>

        <Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateDialog}
          >
            작업장 등록
          </Button>
        </Box>

        {/* <Box sx={{ flex: '0 0 100px' }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleReset}
              >
                초기화
              </Button>
            </Box> */}
      </Box>

      {/* 검색 영역 */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ flex: '1 1 150px' }}>
            <FormControl fullWidth size="small">
              <InputLabel>검색 조건</InputLabel>
              <Select
                value={inputValues.searchCnd}
                label="검색 조건"
                onChange={(e) => handleInputChange('searchCnd', e.target.value)}
              >
                <MenuItem value="0">작업장 코드</MenuItem>
                <MenuItem value="1">작업장명</MenuItem>
                <MenuItem value="2">위치</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ flex: '1 1 150px' }}>
            <FormControl fullWidth size="small">
              <InputLabel>상태</InputLabel>
              <Select
                value={inputValues.status}
                label="상태"
                onChange={(e) => handleInputChange('status', e.target.value)}
              >
                <MenuItem value="">전체</MenuItem>
                <MenuItem value="ACTIVE">활성</MenuItem>
                <MenuItem value="INACTIVE">비활성</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ flex: '1 1 200px' }}>
            <TextField
              fullWidth
              size="small"
              label="검색어"
              value={inputValues.searchWrd}
              onChange={(e) => handleInputChange('searchWrd', e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="검색어를 입력하세요"
            />
          </Box>

          <Box sx={{ flex: '1 1 150px' }}>
            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={handleSearch}
            >
              검색
            </Button>
          </Box>
        </Stack>
      </Paper>

      {/* 작업장 목록 */}
      <Paper sx={{ width: '100%' }}>
        <DataGrid
          rows={workplaces}
          columns={columns}
          getRowId={(row) => row.workplaceId || ''}
          hideFooterPagination
          disableRowSelectionOnClick
          sx={{
            border: 'none',
            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: 'action.hover',
            },
          }}
          localeText={{
            noRowsLabel: '조회된 데이터가 없습니다',
            footerRowSelected: (count) => `${count}개 선택됨`,
          }}
        />
      </Paper>

      {/* 작업장 등록/수정 다이얼로그 */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {dialogMode === 'create' ? '작업장 등록' : '작업장 수정'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                required
                label="작업장 코드"
                value={formData.workplaceCode}
                onChange={(e) => handleChange('workplaceCode', e.target.value)}
                disabled={dialogMode === 'edit'}
              />
              <TextField
                fullWidth
                required
                label="작업장명"
                value={formData.workplaceName}
                onChange={(e) => handleChange('workplaceName', e.target.value)}
              />
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                label="위치"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
              />
              <TextField
                fullWidth
                label="타입"
                value={formData.workplaceType}
                onChange={(e) => handleChange('workplaceType', e.target.value)}
              />
            </Stack>
            <Stack direction="row" spacing={2}>
              <FormControl fullWidth>
                <InputLabel>상태</InputLabel>
                <Select
                  value={formData.status}
                  label="상태"
                  onChange={(e) => handleChange('status', e.target.value)}
                >
                  <MenuItem value="ACTIVE">활성</MenuItem>
                  <MenuItem value="INACTIVE">비활성</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>사용 여부</InputLabel>
                <Select
                  value={formData.useYn}
                  label="사용 여부"
                  onChange={(e) => handleChange('useYn', e.target.value)}
                >
                  <MenuItem value="Y">사용</MenuItem>
                  <MenuItem value="N">미사용</MenuItem>
                </Select>
              </FormControl>
            </Stack>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="설명"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSave} variant="contained" color="primary">
            저장
          </Button>
          <Button onClick={handleCloseDialog}>취소</Button>
        </DialogActions>
      </Dialog>

      {/* 작업자 관리 다이얼로그 */}
      {selectedWorkplace && (
        <WorkplaceWorkerDialog
          open={openWorkerDialog}
          workplace={selectedWorkplace}
          onClose={handleCloseWorkerDialog}
        />
      )}

      {/* 스낵바 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

// 작업자 관리 다이얼로그 컴포넌트
interface WorkplaceWorkerDialogProps {
  open: boolean;
  workplace: Workplace;
  onClose: () => void;
}

const WorkplaceWorkerDialog: React.FC<WorkplaceWorkerDialogProps> = ({
  open,
  workplace,
  onClose,
}) => {
  const { useCallback } = React;
  const [workers, setWorkers] = useState<WorkplaceWorker[]>([]);
  const [newWorker, setNewWorker] = useState<WorkplaceWorker>({
    workplaceId: workplace.workplaceId!,
    workerId: '',
    workerName: '',
    position: '',
    role: 'MEMBER',
  });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const fetchWorkers = useCallback(async () => {
    try {
      const response = await workplaceService.getWorkplaceWorkers(
        workplace.workplaceId!
      );
      if (response.resultCode === 200 && response.result?.resultList) {
        setWorkers(response.result.resultList);
      }
    } catch (error) {
      console.error('Failed to fetch workers:', error);
    }
  }, [workplace.workplaceId]);

  useEffect(() => {
    if (open) {
      fetchWorkers();
    }
  }, [open, fetchWorkers]);

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleAddWorker = async () => {
    if (!newWorker.workerId || !newWorker.workerName) {
      showSnackbar('작업자 ID와 이름을 입력해주세요.', 'error');
      return;
    }

    try {
      await workplaceService.addWorkplaceWorker(
        workplace.workplaceId!,
        newWorker
      );
      showSnackbar('작업자가 추가되었습니다.', 'success');
      setNewWorker({
        workplaceId: workplace.workplaceId!,
        workerId: '',
        workerName: '',
        position: '',
        role: 'MEMBER',
      });
      fetchWorkers();
    } catch (error) {
      console.error('Failed to add worker:', error);
      showSnackbar('작업자 추가에 실패했습니다.', 'error');
    }
  };

  const handleRemoveWorker = async (workplaceWorkerId: string) => {
    if (window.confirm('작업자를 제외하시겠습니까?')) {
      try {
        await workplaceService.removeWorkplaceWorker(
          workplace.workplaceId!,
          workplaceWorkerId
        );
        showSnackbar('작업자가 제외되었습니다.', 'success');
        fetchWorkers();
      } catch (error) {
        console.error('Failed to remove worker:', error);
        showSnackbar('작업자 제외에 실패했습니다.', 'error');
      }
    }
  };

  const workerColumns: GridColDef[] = [
    {
      field: 'workerId',
      headerName: '작업자 ID',
      flex: 1,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'workerName',
      headerName: '작업자명',
      flex: 1,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'position',
      headerName: '직책',
      flex: 1,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'role',
      headerName: '역할',
      flex: 1,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value === 'LEADER' ? '팀장' : '팀원'}
          color={params.value === 'LEADER' ? 'primary' : 'default'}
          size="small"
        />
      ),
    },
    {
      field: 'regDt',
      headerName: '등록일',
      flex: 1.5,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'actions',
      headerName: '관리',
      flex: 0.8,
      align: 'center',
      headerAlign: 'center',
      sortable: false,
      renderCell: (params) => (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
          }}
        >
          <IconButton
            size="small"
            color="error"
            onClick={() => handleRemoveWorker(params.row.workplaceWorkerId!)}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>작업자 관리 - {workplace.workplaceName}</DialogTitle>
        <DialogContent>
          {/* 작업자 추가 폼 */}
          <Card sx={{ mb: 2, bgcolor: '#f5f5f5' }}>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                작업자 추가
              </Typography>
              <Stack
                direction="row"
                spacing={2}
                sx={{ mt: 0.5, flexWrap: 'wrap' }}
              >
                <Box sx={{ flex: '1 1 150px' }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="작업자 ID"
                    value={newWorker.workerId}
                    onChange={(e) =>
                      setNewWorker({ ...newWorker, workerId: e.target.value })
                    }
                  />
                </Box>
                <Box sx={{ flex: '1 1 150px' }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="작업자명"
                    value={newWorker.workerName}
                    onChange={(e) =>
                      setNewWorker({ ...newWorker, workerName: e.target.value })
                    }
                  />
                </Box>
                <Box sx={{ flex: '1 1 120px' }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="직책"
                    value={newWorker.position}
                    onChange={(e) =>
                      setNewWorker({ ...newWorker, position: e.target.value })
                    }
                  />
                </Box>
                <Box sx={{ flex: '1 1 120px' }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>역할</InputLabel>
                    <Select
                      value={newWorker.role}
                      label="역할"
                      onChange={(e) =>
                        setNewWorker({ ...newWorker, role: e.target.value })
                      }
                    >
                      <MenuItem value="LEADER">팀장</MenuItem>
                      <MenuItem value="MEMBER">팀원</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ flex: '0 0 100px' }}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleAddWorker}
                    startIcon={<AddIcon />}
                  >
                    추가
                  </Button>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* 작업자 목록 */}
          <Paper sx={{ height: 400, width: '100%' }}>
            <DataGrid
              rows={workers}
              columns={workerColumns}
              getRowId={(row) => row.workplaceWorkerId || ''}
              hideFooterPagination
              disableRowSelectionOnClick
              sx={{
                border: 'none',
                '& .MuiDataGrid-cell:focus': {
                  outline: 'none',
                },
                '& .MuiDataGrid-row:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
              localeText={{
                noRowsLabel: '등록된 작업자가 없습니다',
                footerRowSelected: (count) => `${count}개 선택됨`,
              }}
            />
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>닫기</Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default WorkplaceManagement;
