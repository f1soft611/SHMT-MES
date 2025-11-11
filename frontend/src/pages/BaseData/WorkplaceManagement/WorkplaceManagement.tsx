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
  Tabs,
  Tab,
} from '@mui/material';
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  People as PeopleIcon,
  Search as SearchIcon,
  Build as BuildIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Workplace, WorkplaceWorker } from '../../../types/workplace';
import { WorkplaceProcess } from '../../../types/process';
import workplaceService from '../../../services/workplaceService';
import processService from '../../../services/processService';
import { usePermissions } from '../../../contexts/PermissionContext';
import UserSelectionDialog from '../../../components/common/UserSelectionDialog';
import { User } from '../../../services/admin/userService';

// 작업장 등록 유효성 검사 스키마
const workplaceSchema: yup.ObjectSchema<Workplace> = yup.object({
  workplaceId: yup.string(),
  workplaceCode: yup.string().required('작업장 코드는 필수입니다.'),
  workplaceName: yup.string().required('작업장명은 필수입니다.'),
  description: yup.string(),
  location: yup.string(),
  workplaceType: yup.string(),
  status: yup.string().required('상태는 필수입니다.'),
  useYn: yup.string().required('사용 여부는 필수입니다.'),
});

const WorkplaceManagement: React.FC = () => {
  // 권한 체크
  const { hasWritePermission } = usePermissions();
  const canWrite = hasWritePermission('/base/workplace');

  const [workplaces, setWorkplaces] = useState<Workplace[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedWorkplace, setSelectedWorkplace] = useState<Workplace | null>(
    null
  );
  const [openDialog, setOpenDialog] = useState(false);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [detailTab, setDetailTab] = useState(0);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
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

  // react-hook-form 설정 - 작업장
  const {
    control: workplaceControl,
    handleSubmit: handleWorkplaceSubmit,
    reset: resetWorkplaceForm,
    formState: { errors: workplaceErrors },
  } = useForm<Workplace>({
    resolver: yupResolver(workplaceSchema),
    defaultValues: {
      workplaceCode: '',
      workplaceName: '',
      description: '',
      location: '',
      workplaceType: '',
      status: 'ACTIVE',
      useYn: 'Y',
    },
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

  // 작업장 목록 조회 (searchParams, paginationModel 의존성으로 자동 실행)
  const fetchWorkplaces = useCallback(async () => {
    try {
      const response = await workplaceService.getWorkplaceList(
        paginationModel.page,
        paginationModel.pageSize,
        searchParams
      );
      if (response.resultCode === 200 && response.result?.resultList) {
        setWorkplaces(response.result.resultList);
        setTotalCount(parseInt(response.result.resultCnt || '0'));
      }
    } catch (error) {
      console.error('Failed to fetch workplaces:', error);
      showSnackbar('작업장 목록을 불러오는데 실패했습니다.', 'error');
    }
  }, [searchParams, paginationModel]);

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

  // 검색 실행 (입력값을 검색 파라미터로 복사하고 페이지를 0으로 리셋)
  const handleSearch = () => {
    setSearchParams({ ...inputValues });
    setPaginationModel({ ...paginationModel, page: 0 });
  };

  const handleInputChange = (field: string, value: string) => {
    setInputValues({
      ...inputValues,
      [field]: value,
    });
  };

  const handleOpenCreateDialog = () => {
    setDialogMode('create');
    resetWorkplaceForm({
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
    resetWorkplaceForm(workplace);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    resetWorkplaceForm();
  };

  const handleSave = async (data: Workplace) => {
    try {
      if (dialogMode === 'create') {
        const result = await workplaceService.createWorkplace(data);
        if (result.resultCode === 200) {
          showSnackbar('작업장이 등록되었습니다.', 'success');
        } else {
          showSnackbar(result.result.message, 'error');
        }
      } else {
        await workplaceService.updateWorkplace(data.workplaceId!, data);
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

  const handleOpenDetailDialog = (workplace: Workplace) => {
    setSelectedWorkplace(workplace);
    setDetailTab(0);
    setOpenDetailDialog(true);
  };

  const handleCloseDetailDialog = () => {
    setOpenDetailDialog(false);
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
      headerAlign: 'center',
    },
    {
      field: 'location',
      headerName: '위치',
      flex: 1,
      headerAlign: 'center',
    },
    {
      field: 'workplaceType',
      headerName: '타입',
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'status',
      headerName: '상태',
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
      field: 'workerCnt',
      headerName: '작업자 수',
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'proCnt',
      headerName: '공정 수',
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'regDt',
      headerName: '등록일',
      width: 200,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'actions',
      headerName: '관리',
      width: 200,
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
              onClick={() => {
                handleOpenDetailDialog(params.row);
                setDetailTab(0);
              }}
              title="작업자 관리"
            >
              <PeopleIcon />
            </IconButton>
            <IconButton
              size="small"
              color="primary"
              onClick={() => {
                handleOpenDetailDialog(params.row);
                setDetailTab(1);
              }}
              title="공정 관리"
            >
              <BuildIcon />
            </IconButton>
            <IconButton
              size="small"
              color="primary"
              onClick={() => handleOpenEditDialog(params.row)}
              title="수정"
              disabled={!canWrite}
            >
              <EditIcon />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDelete(params.row.workplaceId!)}
              title="삭제"
              disabled={!canWrite}
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
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 120 }}>
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

          <TextField
            size="small"
            value={inputValues.searchWrd}
            onChange={(e) => handleInputChange('searchWrd', e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            sx={{ flex: 1 }}
            placeholder="검색어를 입력하세요"
          />

          <FormControl size="small" sx={{ minWidth: 120 }}>
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

          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={handleSearch}
          >
            검색
          </Button>

          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateDialog}
            disabled={!canWrite}
          >
            작업장 등록
          </Button>
        </Stack>
      </Paper>

      {/* 작업장 목록 */}
      <Paper sx={{ width: '100%' }}>
        <DataGrid
          rows={workplaces}
          columns={columns}
          getRowId={(row) => row.workplaceId || ''}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[5, 10, 25, 50]}
          rowCount={totalCount}
          paginationMode="server"
          disableRowSelectionOnClick
          autoHeight
          sx={{
            border: 'none',
            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: 'action.hover',
            },
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
              <Controller
                name="workplaceCode"
                control={workplaceControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    required
                    label="작업장 코드"
                    disabled={dialogMode === 'edit'}
                    error={!!workplaceErrors.workplaceCode}
                    helperText={workplaceErrors.workplaceCode?.message}
                  />
                )}
              />
              <Controller
                name="workplaceName"
                control={workplaceControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    required
                    label="작업장명"
                    error={!!workplaceErrors.workplaceName}
                    helperText={workplaceErrors.workplaceName?.message}
                  />
                )}
              />
            </Stack>
            <Stack direction="row" spacing={2}>
              <Controller
                name="location"
                control={workplaceControl}
                render={({ field }) => (
                  <TextField {...field} fullWidth label="위치" />
                )}
              />
              <Controller
                name="workplaceType"
                control={workplaceControl}
                render={({ field }) => (
                  <TextField {...field} fullWidth label="타입" />
                )}
              />
            </Stack>
            <Stack direction="row" spacing={2}>
              <Controller
                name="status"
                control={workplaceControl}
                render={({ field }) => (
                  <FormControl fullWidth error={!!workplaceErrors.status}>
                    <InputLabel>상태</InputLabel>
                    <Select {...field} label="상태">
                      <MenuItem value="ACTIVE">활성</MenuItem>
                      <MenuItem value="INACTIVE">비활성</MenuItem>
                    </Select>
                    {workplaceErrors.status && (
                      <Typography
                        variant="caption"
                        color="error"
                        sx={{ mt: 0.5 }}
                      >
                        {workplaceErrors.status.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
              <Controller
                name="useYn"
                control={workplaceControl}
                render={({ field }) => (
                  <FormControl fullWidth error={!!workplaceErrors.useYn}>
                    <InputLabel>사용 여부</InputLabel>
                    <Select {...field} label="사용 여부">
                      <MenuItem value="Y">사용</MenuItem>
                      <MenuItem value="N">미사용</MenuItem>
                    </Select>
                    {workplaceErrors.useYn && (
                      <Typography
                        variant="caption"
                        color="error"
                        sx={{ mt: 0.5 }}
                      >
                        {workplaceErrors.useYn.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
            </Stack>
            <Controller
              name="description"
              control={workplaceControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  multiline
                  rows={3}
                  label="설명"
                />
              )}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleWorkplaceSubmit(handleSave)}
            variant="contained"
            color="primary"
          >
            저장
          </Button>
          <Button onClick={handleCloseDialog}>취소</Button>
        </DialogActions>
      </Dialog>

      {/* 작업장 상세관리 다이얼로그 */}
      {selectedWorkplace && (
        <WorkplaceDetailDialog
          open={openDetailDialog}
          workplace={selectedWorkplace}
          onClose={handleCloseDetailDialog}
          detailTab={detailTab}
          setDetailTab={setDetailTab}
          showSnackbar={showSnackbar}
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

// 작업장 상세관리 다이얼로그 컴포넌트
interface WorkplaceDetailDialogProps {
  open: boolean;
  workplace: Workplace;
  onClose: () => void;
  detailTab: number;
  setDetailTab: (tab: number) => void;
  showSnackbar: (message: string, severity: 'success' | 'error') => void;
}

const WorkplaceDetailDialog: React.FC<WorkplaceDetailDialogProps> = ({
  open,
  workplace,
  onClose,
  detailTab,
  setDetailTab,
  showSnackbar,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>작업장 상세 관리 - {workplace.workplaceName}</DialogTitle>
      <DialogContent>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs
            value={detailTab}
            onChange={(e, newValue) => setDetailTab(newValue)}
          >
            <Tab
              label="작업자 관리"
              icon={<PeopleIcon />}
              iconPosition="start"
            />
            <Tab label="공정 관리" icon={<BuildIcon />} iconPosition="start" />
          </Tabs>
        </Box>
        {detailTab === 0 && (
          <WorkplaceWorkerTab
            workplace={workplace}
            showSnackbar={showSnackbar}
          />
        )}
        {detailTab === 1 && (
          <WorkplaceProcessTab
            workplace={workplace}
            showSnackbar={showSnackbar}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>닫기</Button>
      </DialogActions>
    </Dialog>
  );
};

// 작업자 관리 탭
const WorkplaceWorkerTab: React.FC<{
  workplace: Workplace;
  showSnackbar: (m: string, s: 'success' | 'error') => void;
}> = ({ workplace, showSnackbar }) => {
  const { useCallback } = React;
  const [workers, setWorkers] = useState<WorkplaceWorker[]>([]);
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingWorker, setEditingWorker] = useState<WorkplaceWorker | null>(
    null
  );

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
    fetchWorkers();
  }, [fetchWorkers]);

  const handleUserSelect = async (user: User) => {
    const newWorker: WorkplaceWorker = {
      workplaceId: workplace.workplaceId!,
      workerId: user.mberId,
      workerName: user.mberNm,
      position: '',
      role: 'MEMBER',
    };

    try {
      await workplaceService.addWorkplaceWorker(
        workplace.workplaceId!,
        newWorker
      );
      showSnackbar('작업자가 추가되었습니다.', 'success');
      fetchWorkers();
    } catch (error) {
      console.error('Failed to add worker:', error);
      showSnackbar('작업자 추가에 실패했습니다.', 'error');
    }
  };

  const handleEditWorker = (worker: WorkplaceWorker) => {
    setEditingWorker({ ...worker });
    setOpenEditDialog(true);
  };

  const handleUpdateWorker = async () => {
    if (!editingWorker) return;

    try {
      await workplaceService.updateWorkplaceWorker(
        workplace.workplaceId!,
        editingWorker.workplaceWorkerId!,
        editingWorker
      );
      showSnackbar('작업자 정보가 수정되었습니다.', 'success');
      setOpenEditDialog(false);
      setEditingWorker(null);
      fetchWorkers();
    } catch (error) {
      console.error('Failed to update worker:', error);
      showSnackbar('작업자 수정에 실패했습니다.', 'error');
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
      width: 200,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'actions',
      headerName: '관리',
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
          <Stack direction="row" spacing={1}>
            <IconButton
              size="small"
              color="primary"
              onClick={() => handleEditWorker(params.row)}
              title="수정"
            >
              <EditIcon />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              onClick={() => handleRemoveWorker(params.row.workplaceWorkerId!)}
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
      <Card sx={{ mb: 2, bgcolor: '#f5f5f5' }}>
        <CardContent>
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="subtitle1">작업자 관리</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenUserDialog(true)}
            >
              작업자 추가
            </Button>
          </Stack>
        </CardContent>
      </Card>

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

      {/* 사용자 선택 다이얼로그 */}
      <UserSelectionDialog
        open={openUserDialog}
        onClose={() => setOpenUserDialog(false)}
        onSelect={handleUserSelect}
        title="작업자 선택"
      />

      {/* 작업자 수정 다이얼로그 */}
      <Dialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>작업자 수정</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="작업자 ID"
              value={editingWorker?.workerId || ''}
              disabled
            />
            <TextField
              fullWidth
              label="작업자명"
              value={editingWorker?.workerName || ''}
              disabled
            />
            <TextField
              fullWidth
              label="직책"
              value={editingWorker?.position || ''}
              onChange={(e) =>
                setEditingWorker({
                  ...editingWorker!,
                  position: e.target.value,
                })
              }
            />
            <FormControl fullWidth>
              <InputLabel>역할</InputLabel>
              <Select
                value={editingWorker?.role || 'MEMBER'}
                label="역할"
                onChange={(e) =>
                  setEditingWorker({
                    ...editingWorker!,
                    role: e.target.value,
                  })
                }
              >
                <MenuItem value="LEADER">팀장</MenuItem>
                <MenuItem value="MEMBER">팀원</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleUpdateWorker} variant="contained">
            저장
          </Button>
          <Button onClick={() => setOpenEditDialog(false)}>취소</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// 등록된 공정 관리 탭
const WorkplaceProcessTab: React.FC<{
  workplace: Workplace;
  showSnackbar: (m: string, s: 'success' | 'error') => void;
}> = ({ workplace, showSnackbar }) => {
  const [processes, setProcesses] = useState<WorkplaceProcess[]>([]);
  const [availableProcesses, setAvailableProcesses] = useState<any[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState<WorkplaceProcess>({
    workplaceId: workplace.workplaceId!,
    workplaceCode: workplace.workplaceCode!,
    workplaceName: workplace.workplaceName,
    processId: '',
    processCode: '',
    processName: '',
    useYn: 'Y',
  });

  const fetchProcesses = useCallback(async () => {
    try {
      const response = await workplaceService.getWorkplaceProcesses(
        workplace.workplaceId!
      );
      if (response.resultCode === 200 && response.result?.resultList) {
        setProcesses(response.result.resultList);
      }
    } catch (error) {
      console.error('Failed to fetch processes:', error);
    }
  }, [workplace.workplaceId]);

  const fetchAvailableProcesses = useCallback(async () => {
    try {
      const response = await processService.getProcessList(0, 1000, {
        status: 'ACTIVE',
        useYn: 'Y',
      });
      if (response.resultCode === 200 && response.result?.resultList) {
        setAvailableProcesses(response.result.resultList);
      }
    } catch (error) {
      console.error('Failed to fetch available processes:', error);
    }
  }, []);

  useEffect(() => {
    fetchProcesses();
    fetchAvailableProcesses();
  }, [fetchProcesses, fetchAvailableProcesses]);

  const handleProcessChange = (processId: string) => {
    const selectedProcess = availableProcesses.find(
      (p) => p.processId === processId
    );
    if (selectedProcess) {
      setFormData({
        ...formData,
        processId: selectedProcess.processId,
        processCode: selectedProcess.processCode,
        processName: selectedProcess.processName,
      });
    } else {
      setFormData({ ...formData, processId });
    }
  };

  const handleSave = async () => {
    try {
      await workplaceService.addWorkplaceProcess(
        workplace.workplaceId!,
        formData
      );
      showSnackbar('공정이 등록되었습니다.', 'success');
      setOpenDialog(false);
      fetchProcesses();
    } catch (error) {
      console.error('Failed to save process:', error);
      showSnackbar('저장에 실패했습니다.', 'error');
    }
  };

  const handleDelete = async (workplaceProcessCode: string) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        await workplaceService.removeWorkplaceProcess(
          workplace.workplaceCode!,
          workplaceProcessCode
        );
        showSnackbar('공정이 삭제되었습니다.', 'success');
        fetchProcesses();
      } catch (error) {
        console.error('Failed to delete process:', error);
        showSnackbar('삭제에 실패했습니다.', 'error');
      }
    }
  };

  const processColumns: GridColDef[] = [
    {
      field: 'processCode',
      headerName: '공정 코드',
      flex: 1,
      // align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'processName',
      headerName: '공정명',
      flex: 1.2,
      // align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'regDt',
      headerName: '등록일',
      width: 200,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'actions',
      headerName: '관리',
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
            onClick={() => handleDelete(params.row.processCode!)}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Card sx={{ mb: 2, bgcolor: '#f5f5f5' }}>
        <CardContent>
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="subtitle1">공정 관리</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setFormData({
                  workplaceId: workplace.workplaceId!,
                  workplaceCode: workplace.workplaceCode!,
                  processId: '',
                  workplaceName: workplace.workplaceName,
                  processCode: '',
                  processName: '',
                  useYn: 'Y',
                });
                setOpenDialog(true);
              }}
            >
              공정 추가
            </Button>
          </Stack>
        </CardContent>
      </Card>
      <Paper sx={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={processes}
          columns={processColumns}
          getRowId={(row) => row.workplaceProcessId || ''}
          hideFooterPagination
          disableRowSelectionOnClick
          localeText={{ noRowsLabel: '등록된 공정이 없습니다' }}
        />
      </Paper>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>공정 등록</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth required>
              <InputLabel>공정</InputLabel>
              <Select
                value={formData.processId}
                label="공정"
                onChange={(e) => handleProcessChange(e.target.value)}
              >
                {availableProcesses.map((process) => (
                  <MenuItem key={process.processId} value={process.processId}>
                    {process.processName} ({process.processCode})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSave} variant="contained">
            저장
          </Button>
          <Button onClick={() => setOpenDialog(false)}>취소</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WorkplaceManagement;
