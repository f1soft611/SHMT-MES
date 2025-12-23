import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
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
} from '@mui/material';
import { GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  People as PeopleIcon,
  Search as SearchIcon,
  Build as BuildIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Workplace } from '../../../types/workplace';
import workplaceService from '../../../services/workplaceService';
import { usePermissions } from '../../../contexts/PermissionContext';
import WorkplaceDetailDialog from './components/WorkplaceDetailDialog';
import DataTable from '../../../components/common/DataTable/DataTable';
import PageHeader from '../../../components/common/PageHeader/PageHeader';
import ConfirmDialog from '../../../components/common/Feedback/ConfirmDialog';
import { useToast } from '../../../components/common/Feedback/ToastProvider';

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
  const SHOW_WORKPLACE_PROCESS = false;
  // 권한 체크
  const { hasWritePermission, refreshPermissions } = usePermissions();
  const workplaceMenuUrls = ['/base/workplace'];
  const canWrite = workplaceMenuUrls.some((url) => hasWritePermission(url));

  // useEffect(() => {
  //   const refresh = async () => {
  //     await refreshPermissions();
  //   };
  //   refresh();
  // }, [refreshPermissions]);

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
  const [confirmDelete, setConfirmDelete] = useState<{
    open: boolean;
    workplaceId?: string;
  }>({ open: false });
  const { showToast } = useToast();

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
      showToast({
        message: '작업장 목록을 불러오는데 실패했습니다.',
        severity: 'error',
      });
    }
  }, [searchParams, paginationModel, showToast]);

  // 컴포넌트 마운트 시와 searchParams 변경 시에만 조회
  useEffect(() => {
    fetchWorkplaces();
  }, [fetchWorkplaces]);

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    showToast({ message, severity });
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
    if (!canWrite) {
      showToast({ message: '쓰기 권한이 없습니다.', severity: 'error' });
      return;
    }
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
    if (!canWrite) {
      showToast({ message: '쓰기 권한이 없습니다.', severity: 'error' });
      return;
    }
    setDialogMode('edit');
    resetWorkplaceForm(workplace);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    resetWorkplaceForm();
  };

  const handleSave = async (data: Workplace) => {
    if (!canWrite) {
      showToast({ message: '쓰기 권한이 없습니다.', severity: 'error' });
      return;
    }
    try {
      if (dialogMode === 'create') {
        const result = await workplaceService.createWorkplace(data);
        if (result.resultCode === 200) {
          showToast({
            message: '작업장이 등록되었습니다.',
            severity: 'success',
          });
        } else {
          showToast({ message: result.result.message, severity: 'error' });
        }
      } else {
        await workplaceService.updateWorkplace(data.workplaceId!, data);
        showToast({ message: '작업장이 수정되었습니다.', severity: 'success' });
      }
      handleCloseDialog();
      // 저장 후 현재 검색 조건으로 다시 조회
      fetchWorkplaces();
    } catch (error) {
      console.error('Failed to save workplace:', error);
      showToast({ message: '저장에 실패했습니다.', severity: 'error' });
    }
  };

  const handleDeleteConfirm = async (workplaceId: string) => {
    if (!canWrite) {
      showToast({ message: '쓰기 권한이 없습니다.', severity: 'error' });
      return;
    }
    try {
      await workplaceService.deleteWorkplace(workplaceId);
      showToast({ message: '작업장이 삭제되었습니다.', severity: 'success' });
      fetchWorkplaces();
    } catch (error) {
      console.error('Failed to delete workplace:', error);
      showToast({ message: '삭제에 실패했습니다.', severity: 'error' });
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
      renderCell: (params) => (params.value === 'A' ? 'A(주야)' : 'B(교대)'),
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
      width: 150,
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
              <PeopleIcon fontSize="small" />
            </IconButton>
            {SHOW_WORKPLACE_PROCESS && (
              <IconButton
                size="small"
                color="primary"
                onClick={() => {
                  handleOpenDetailDialog(params.row);
                  setDetailTab(1);
                }}
                title="공정 관리"
              >
                <BuildIcon fontSize="small" />
              </IconButton>
            )}
            <IconButton
              size="small"
              color="primary"
              onClick={() => handleOpenEditDialog(params.row)}
              title="수정"
              disabled={!canWrite}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            {/* <IconButton
              size="small"
              color="error"
              onClick={() => handleDelete(params.row.workplaceId!)}
              title="삭제"
              disabled={!canWrite}
            >
              <DeleteIcon />
            </IconButton> */}
          </Stack>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <PageHeader
        title=""
        crumbs={[{ label: '기준정보' }, { label: '작업장 관리' }]}
      />

      {/* 검색 영역 */}
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
      <Paper>
        <DataTable
          rows={workplaces}
          columns={columns}
          getRowId={(row) => row.workplaceId || ''}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          rowCount={totalCount}
          loading={false}
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
        <DialogContent dividers={true}>
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
                  <FormControl fullWidth error={!!workplaceErrors.status}>
                    <InputLabel>타입</InputLabel>
                    <Select {...field} label="상태">
                      <MenuItem value="A">A(주야)</MenuItem>
                      <MenuItem value="B">B(교대)</MenuItem>
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

              {/* <Controller
                name="workplaceType"
                control={workplaceControl}
                render={({ field }) => (
                  <TextField {...field} fullWidth label="타입" />
                )}
              /> */}
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
            disabled={!canWrite}
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

      <ConfirmDialog
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false })}
        title="작업장 삭제"
        message="정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
        confirmText="삭제"
        onConfirm={async () => {
          if (confirmDelete.workplaceId) {
            await handleDeleteConfirm(confirmDelete.workplaceId);
          }
          setConfirmDelete({ open: false });
        }}
      />
    </Box>
  );
};

export default WorkplaceManagement;
