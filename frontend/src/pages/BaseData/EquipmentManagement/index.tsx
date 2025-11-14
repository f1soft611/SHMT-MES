import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
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
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Equipment } from '../../../types/equipment';
import equipmentService from '../../../services/equipmentService';
import { usePermissions } from '../../../contexts/PermissionContext';
import EquipmentDetailDialog from './components/EquipmentDetailDialog';

// 설비 등록 유효성 검사 스키마
const equipmentSchema: yup.ObjectSchema<Equipment> = yup.object({
  equipmentId: yup.string(),
  equipSysCd: yup.string(),
  equipCd: yup.string().required('설비 코드는 필수입니다.'),
  equipSpec: yup.string(),
  equipStruct: yup.string(),
  useFlag: yup.string().required('사용 여부는 필수입니다.'),
  optime: yup.string(),
  managerCode: yup.string(),
  manager2Code: yup.string(),
  opmanCode: yup.string(),
  opman2Code: yup.string(),
  plcAddress: yup
    .string()
    .test(
      'is-valid-ip-port',
      '올바른 IP:Port 형식이 아닙니다. (예: 192.168.1.1:502)',
      (value) => {
        if (!value) return true; // 빈 값 허용

        // IP:Port 형식 검증
        const ipPortRegex =
          /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})(?::(\d+))?$/;
        const match = value.match(ipPortRegex);

        if (!match) return false;

        // IP 주소 검증 (0-255)
        const ipValid = match.slice(1, 5).every((octet) => {
          const num = parseInt(octet, 10);
          return num >= 0 && num <= 255;
        });

        // 포트 번호 검증 (1-65535)
        const portValid =
          !match[5] ||
          (parseInt(match[5], 10) >= 1 && parseInt(match[5], 10) <= 65535);

        return ipValid && portValid;
      }
    ),
  location: yup.string(),
  statusFlag: yup.string().required('상태는 필수입니다.'),
  optime2: yup.string(),
  remark: yup.string(),
  equipmentName: yup.string().required('설비명은 필수입니다.'),
  changeDate: yup.string(),
  regUserId: yup.string(),
  regDt: yup.string(),
  updUserId: yup.string(),
  updDt: yup.string(),
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
    pageSize: 25,
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

  // 설비 목록 조회
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

  useEffect(() => {
    fetchEquipments();
  }, [fetchEquipments]);

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // 검색 실행
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
          showSnackbar(
            result.result?.message || '등록에 실패했습니다.',
            'error'
          );
        }
      } else {
        await equipmentService.updateEquipment(data.equipCd!, data);
        showSnackbar('설비가 수정되었습니다.', 'success');
      }
      handleCloseDialog();
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

  // const getUseFlagColor = (useFlag: string) => {
  //   return useFlag === 'Y' ? 'primary' : 'default';
  // };

  // const getUseFlagLabel = (useFlag: string) => {
  //   return useFlag === 'Y' ? '사용' : '미사용';
  // };

  const columns: GridColDef[] = [
    // {
    //   field: 'equipSysCd',
    //   headerName: '시스템 코드',
    //   flex: 1,
    //   headerAlign: 'center',
    //   align: 'center',
    // },
    {
      field: 'equipCd',
      headerName: '설비 코드',
      flex: 1,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'equipmentName',
      headerName: '설비명',
      flex: 1.2,
      headerAlign: 'center',
    },
    {
      field: 'equipSpec',
      headerName: '설비 규격',
      flex: 1,
      headerAlign: 'center',
    },
    {
      field: 'location',
      headerName: '위치',
      flex: 1,
      headerAlign: 'center',
    },
    {
      field: 'statusFlag',
      headerName: '상태',
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
      field: 'regDt',
      headerName: '등록일',
      width: 180,
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
              onClick={() => handleOpenEditDialog(params.row)}
              title="수정"
              disabled={!canWrite}
            >
              <EditIcon />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDelete(params.row.equipmentId)}
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
          <Typography variant="h5">설비 관리</Typography>
        </Box>
      </Box>

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
              <MenuItem value="1">설비 코드</MenuItem>
              <MenuItem value="2">설비명</MenuItem>
              <MenuItem value="3">위치</MenuItem>
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

          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateDialog}
            disabled={!canWrite}
          >
            설비 등록
          </Button>
        </Stack>
      </Paper>

      <Paper sx={{ width: '100%' }}>
        <DataGrid
          rows={equipments}
          columns={columns}
          getRowId={(row) => row.equipmentId || ''}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[5, 10, 25, 50]}
          rowCount={totalCount}
          paginationMode="server"
          disableRowSelectionOnClick
          autoHeight
          sx={{
            border: 'none',
            '& .MuiDataGrid-cell:focus': { outline: 'none' },
            '& .MuiDataGrid-row:hover': { backgroundColor: 'action.hover' },
          }}
        />
      </Paper>

      {/* 설비 등록/수정 다이얼로그 */}
      <EquipmentDetailDialog
        open={openDialog}
        dialogMode={dialogMode}
        onClose={handleCloseDialog}
        onSave={handleEquipmentSubmit(handleSave)}
        control={equipmentControl}
        errors={equipmentErrors}
      />

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

export default EquipmentManagement;
