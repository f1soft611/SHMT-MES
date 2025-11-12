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
  Alert,
  Snackbar,
} from '@mui/material';
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Equipment } from '../../../types/equipment';
import equipmentService from '../../../services/equipmentService';
import { usePermissions } from '../../../contexts/PermissionContext';

// 설비 등록 유효성 검사 스키마
const equipmentSchema: yup.ObjectSchema<Equipment> = yup.object({
  equipmentId: yup.string(),
  equipSysCd: yup.string().required('시스템 코드는 필수입니다.'),
  equipCd: yup.string().required('설비 코드는 필수입니다.'),
  equipSpec: yup.string(),
  equipStruct: yup.string(),
  useFlag: yup.string().required('사용 여부는 필수입니다.'),
  optime: yup.string(),
  managerCode: yup.string(),
  manager2Code: yup.string(),
  opmanCode: yup.string(),
  opman2Code: yup.string(),
  plcAddress: yup.string(),
  location: yup.string(),
  statusFlag: yup.string().required('상태는 필수입니다.'),
  optime2: yup.string(),
  remark: yup.string(),
  equipmentName: yup.string(),
  changeDate: yup.string(),
});

const EquipmentManagement: React.FC = () => {
  // 권한 체크
  const { hasWritePermission } = usePermissions();
  const canWrite = hasWritePermission('/base/equipment');

  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
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

  // react-hook-form 설정 - 설비
  const {
    control: equipmentControl,
    handleSubmit: handleEquipmentSubmit,
    reset: resetEquipmentForm,
    formState: { errors: equipmentErrors },
  } = useForm<Equipment>({
    resolver: yupResolver(equipmentSchema),
    defaultValues: {
      equipSysCd: '',
      equipCd: '',
      equipSpec: '',
      equipStruct: '',
      useFlag: 'Y',
      optime: '',
      managerCode: '',
      manager2Code: '',
      opmanCode: '',
      opman2Code: '',
      plcAddress: '',
      location: '',
      statusFlag: '1',
      optime2: '',
      remark: '',
      equipmentName: '',
      changeDate: '',
    },
  });

  // 실제 검색에 사용되는 파라미터
  const [searchParams, setSearchParams] = useState({
    searchCnd: '1',
    searchWrd: '',
    statusFlag: '',
  });

  // 입력 필드용 상태 (화면 입력용)
  const [inputValues, setInputValues] = useState({
    searchCnd: '1',
    searchWrd: '',
    statusFlag: '',
  });

  // 설비 목록 조회 (searchParams, paginationModel 의존성으로 자동 실행)
  const fetchEquipments = useCallback(async () => {
    try {
      const response = await equipmentService.getEquipmentList(
        paginationModel.page,
        paginationModel.pageSize,
        searchParams
      );
      if (response.resultCode === 200 && response.result?.resultList) {
        setEquipments(response.result.resultList);
        setTotalCount(parseInt(response.result.resultCnt || '0'));
      }
    } catch (error) {
      console.error('Failed to fetch equipments:', error);
      showSnackbar('설비 목록을 불러오는데 실패했습니다.', 'error');
    }
  }, [searchParams, paginationModel]);

  // 컴포넌트 마운트 시와 searchParams 변경 시에만 조회
  useEffect(() => {
    fetchEquipments();
  }, [fetchEquipments]);

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
    resetEquipmentForm({
      equipSysCd: '',
      equipCd: '',
      equipSpec: '',
      equipStruct: '',
      useFlag: 'Y',
      optime: '',
      managerCode: '',
      manager2Code: '',
      opmanCode: '',
      opman2Code: '',
      plcAddress: '',
      location: '',
      statusFlag: '1',
      optime2: '',
      remark: '',
      equipmentName: '',
      changeDate: '',
    });
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (equipment: Equipment) => {
    setDialogMode('edit');
    resetEquipmentForm(equipment);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    resetEquipmentForm();
  };

  const handleSave = async (data: Equipment) => {
    try {
      if (dialogMode === 'create') {
        const result = await equipmentService.createEquipment(data);
        if (result.resultCode === 200) {
          showSnackbar('설비가 등록되었습니다.', 'success');
        } else {
          showSnackbar(result.result?.message || '등록에 실패했습니다.', 'error');
        }
      } else {
        await equipmentService.updateEquipment(data.equipmentId!, data);
        showSnackbar('설비가 수정되었습니다.', 'success');
      }
      handleCloseDialog();
      // 저장 후 현재 검색 조건으로 다시 조회
      fetchEquipments();
    } catch (error) {
      console.error('Failed to save equipment:', error);
      showSnackbar('저장에 실패했습니다.', 'error');
    }
  };

  const handleDelete = async (equipmentId: string) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) {
      return;
    }
    try {
      await equipmentService.deleteEquipment(equipmentId);
      showSnackbar('설비가 삭제되었습니다.', 'success');
      fetchEquipments();
    } catch (error) {
      console.error('Failed to delete equipment:', error);
      showSnackbar('삭제에 실패했습니다.', 'error');
    }
  };

  const getStatusColor = (statusFlag: string) => {
    return statusFlag === '1' ? 'success' : 'default';
  };

  const getStatusLabel = (statusFlag: string) => {
    return statusFlag === '1' ? '정상' : '정지';
  };

  const getUseFlagColor = (useFlag: string) => {
    return useFlag === 'Y' ? 'primary' : 'default';
  };

  const getUseFlagLabel = (useFlag: string) => {
    return useFlag === 'Y' ? '사용' : '미사용';
  };

  const columns: GridColDef[] = [
    {
      field: 'equipSysCd',
      headerName: '시스템 코드',
      width: 120,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'equipCd',
      headerName: '설비 코드',
      width: 120,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'equipmentName',
      headerName: '설비명',
      flex: 1,
      minWidth: 150,
      headerAlign: 'center',
    },
    {
      field: 'equipSpec',
      headerName: '설비 규격',
      flex: 1,
      minWidth: 150,
      headerAlign: 'center',
    },
    {
      field: 'location',
      headerName: '위치',
      flex: 1,
      minWidth: 150,
      headerAlign: 'center',
    },
    {
      field: 'statusFlag',
      headerName: '상태',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={getStatusLabel(params.value || '1')}
          color={getStatusColor(params.value || '1') as any}
          size="small"
        />
      ),
    },
    {
      field: 'useFlag',
      headerName: '사용',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={getUseFlagLabel(params.value || 'Y')}
          color={getUseFlagColor(params.value || 'Y') as any}
          size="small"
        />
      ),
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
              onClick={() => handleOpenEditDialog(params.row)}
              disabled={!canWrite}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDelete(params.row.equipmentId)}
              disabled={!canWrite}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ height: 'calc(100vh - 100px)', p: 3 }}>
      <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h5" gutterBottom>
          설비 관리
        </Typography>

        {/* 검색 영역 */}
        <Box sx={{ mb: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>검색 조건</InputLabel>
              <Select
                value={inputValues.searchCnd}
                label="검색 조건"
                onChange={(e) => handleInputChange('searchCnd', e.target.value)}
              >
                <MenuItem value="1">설비 코드</MenuItem>
                <MenuItem value="2">설비명</MenuItem>
                <MenuItem value="3">위치</MenuItem>
              </Select>
            </FormControl>
            <TextField
              size="small"
              placeholder="검색어 입력"
              value={inputValues.searchWrd}
              onChange={(e) => handleInputChange('searchWrd', e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
              sx={{ minWidth: 200 }}
            />
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>상태</InputLabel>
              <Select
                value={inputValues.statusFlag}
                label="상태"
                onChange={(e) => handleInputChange('statusFlag', e.target.value)}
              >
                <MenuItem value="">전체</MenuItem>
                <MenuItem value="1">정상</MenuItem>
                <MenuItem value="0">정지</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={handleSearch}
            >
              검색
            </Button>
            <Box sx={{ flexGrow: 1 }} />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenCreateDialog}
              disabled={!canWrite}
            >
              설비 등록
            </Button>
          </Stack>
        </Box>

        {/* 데이터 그리드 */}
        <Box sx={{ flexGrow: 1 }}>
          <DataGrid
            rows={equipments}
            columns={columns}
            getRowId={(row) => row.equipmentId}
            rowCount={totalCount}
            pageSizeOptions={[10, 25, 50]}
            paginationModel={paginationModel}
            paginationMode="server"
            onPaginationModelChange={setPaginationModel}
            disableRowSelectionOnClick
            sx={{
              '& .MuiDataGrid-cell': {
                borderRight: '1px solid #f0f0f0',
              },
            }}
          />
        </Box>

        {/* 등록/수정 다이얼로그 */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            {dialogMode === 'create' ? '설비 등록' : '설비 수정'}
          </DialogTitle>
          <form onSubmit={handleEquipmentSubmit(handleSave)}>
            <DialogContent>
              <Stack spacing={2}>
                <Stack direction="row" spacing={2}>
                  <Controller
                    name="equipSysCd"
                    control={equipmentControl}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="시스템 코드"
                        required
                        fullWidth
                        error={!!equipmentErrors.equipSysCd}
                        helperText={equipmentErrors.equipSysCd?.message}
                        disabled={dialogMode === 'edit'}
                      />
                    )}
                  />
                  <Controller
                    name="equipCd"
                    control={equipmentControl}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="설비 코드"
                        required
                        fullWidth
                        error={!!equipmentErrors.equipCd}
                        helperText={equipmentErrors.equipCd?.message}
                        disabled={dialogMode === 'edit'}
                      />
                    )}
                  />
                </Stack>
                <Controller
                  name="equipmentName"
                  control={equipmentControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="설비명"
                      fullWidth
                    />
                  )}
                />
                <Controller
                  name="equipSpec"
                  control={equipmentControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="설비 규격"
                      fullWidth
                    />
                  )}
                />
                <Controller
                  name="equipStruct"
                  control={equipmentControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="설비 구조"
                      fullWidth
                    />
                  )}
                />
                <Controller
                  name="location"
                  control={equipmentControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="위치"
                      fullWidth
                    />
                  )}
                />
                <Stack direction="row" spacing={2}>
                  <Controller
                    name="managerCode"
                    control={equipmentControl}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="관리자 코드"
                        fullWidth
                      />
                    )}
                  />
                  <Controller
                    name="opmanCode"
                    control={equipmentControl}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="작업자 코드"
                        fullWidth
                      />
                    )}
                  />
                </Stack>
                <Stack direction="row" spacing={2}>
                  <Controller
                    name="optime"
                    control={equipmentControl}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="가동 시간"
                        fullWidth
                        placeholder="예: 0800-1800"
                      />
                    )}
                  />
                  <Controller
                    name="plcAddress"
                    control={equipmentControl}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="PLC 주소"
                        fullWidth
                      />
                    )}
                  />
                </Stack>
                <Stack direction="row" spacing={2}>
                  <Controller
                    name="statusFlag"
                    control={equipmentControl}
                    render={({ field }) => (
                      <FormControl fullWidth required>
                        <InputLabel>상태</InputLabel>
                        <Select {...field} label="상태">
                          <MenuItem value="1">정상</MenuItem>
                          <MenuItem value="0">정지</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  />
                  <Controller
                    name="useFlag"
                    control={equipmentControl}
                    render={({ field }) => (
                      <FormControl fullWidth required>
                        <InputLabel>사용 여부</InputLabel>
                        <Select {...field} label="사용 여부">
                          <MenuItem value="Y">사용</MenuItem>
                          <MenuItem value="N">미사용</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  />
                </Stack>
                <Controller
                  name="remark"
                  control={equipmentControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="비고"
                      fullWidth
                      multiline
                      rows={3}
                    />
                  )}
                />
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>취소</Button>
              <Button type="submit" variant="contained">
                저장
              </Button>
            </DialogActions>
          </form>
        </Dialog>

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
      </Paper>
    </Box>
  );
};

export default EquipmentManagement;
