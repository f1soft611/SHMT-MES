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
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  BugReport as BugReportIcon,
  CheckCircle as CheckCircleIcon,
  PanTool as PanToolIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Process,
  ProcessDefect,
  ProcessInspection,
  ProcessStopItem,
} from '../../../types/process';
import { CommonDetailCode } from '../../../types/commonCode';
import processService from '../../../services/processService';
import commonCodeService from '../../../services/commonCodeService';
import { usePermissions } from '../../../contexts/PermissionContext';

// 공정 등록 유효성 검사 스키마
const processSchema: yup.ObjectSchema<Process> = yup.object({
  processId: yup.string(),
  processCode: yup.string().required('공정 코드는 필수입니다.'),
  processName: yup.string().required('공정명은 필수입니다.'),
  description: yup.string(),
  processType: yup.string(),
  equipmentIntegrationYn: yup.string().required('설비연동 여부는 필수입니다.'),
  status: yup.string().required('상태는 필수입니다.'),
  useYn: yup.string().required('사용 여부는 필수입니다.'),
  sortOrder: yup
    .number()
    .required('순서는 필수입니다.')
    .min(0, '순서는 0 이상이어야 합니다.'),
});

// 불량코드 추가 유효성 검사 스키마
const defectSchema: yup.ObjectSchema<ProcessDefect> = yup.object({
  processId: yup.string().required('공정 ID는 필수입니다.'),
  processDefectId: yup.string(),
  defectCode: yup.string().required('불량 코드는 필수입니다.'),
  defectName: yup.string().required('불량명은 필수입니다.'),
  defectType: yup.string(),
  description: yup.string(),
  useYn: yup.string().required('사용 여부는 필수입니다.'),
});

// 검사항목 추가 유효성 검사 스키마
const inspectionSchema: yup.ObjectSchema<ProcessInspection> = yup.object({
  processId: yup.string().required('공정 ID는 필수입니다.'),
  processInspectionId: yup.string(),
  inspectionCode: yup.string().required('검사 코드는 필수입니다.'),
  inspectionName: yup.string().required('검사항목명은 필수입니다.'),
  inspectionType: yup.string(),
  standardValue: yup.string(),
  upperLimit: yup.number().nullable(),
  lowerLimit: yup.number().nullable(),
  unit: yup.string(),
  description: yup.string(),
  useYn: yup.string().required('사용 여부는 필수입니다.'),
});

// 중지항목 추가 유효성 검사 스키마
const stopItemSchema: yup.ObjectSchema<ProcessStopItem> = yup.object({
  processId: yup.string().required('공정 ID는 필수입니다.'),
  processStopItemId: yup.string(),
  stopItemCode: yup.string().required('중지항목 코드는 필수입니다.'),
  stopItemName: yup.string().required('중지항목명은 필수입니다.'),
  stopType: yup.string(),
  description: yup.string(),
  useYn: yup.string().required('사용 여부는 필수입니다.'),
});

const ProcessManagement: React.FC = () => {
  // 권한 체크
  const { hasWritePermission } = usePermissions();
  const canWrite = hasWritePermission('/base/process');

  const [processes, setProcesses] = useState<Process[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedProcess, setSelectedProcess] = useState<Process | null>(null);
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

  // react-hook-form 설정 - 공정
  const {
    control: processControl,
    handleSubmit: handleProcessSubmit,
    reset: resetProcessForm,
    formState: { errors: processErrors },
  } = useForm<Process>({
    resolver: yupResolver(processSchema),
    defaultValues: {
      processCode: '',
      processName: '',
      description: '',
      processType: '',
      equipmentIntegrationYn: 'N',
      status: 'ACTIVE',
      useYn: 'Y',
      sortOrder: 0,
    },
  });

  const [searchParams, setSearchParams] = useState({
    searchCnd: '1',
    searchWrd: '',
    status: '',
    equipmentIntegrationYn: '',
  });

  const [inputValues, setInputValues] = useState({
    searchCnd: '1',
    searchWrd: '',
    status: '',
    equipmentIntegrationYn: '',
  });

  const fetchProcesses = useCallback(async () => {
    try {
      const response = await processService.getProcessList(
        paginationModel.page,
        paginationModel.pageSize,
        searchParams
      );
      if (response.resultCode === 200 && response.result?.resultList) {
        setProcesses(response.result.resultList);
        setTotalCount(parseInt(response.result.resultCnt || '0'));
      }
    } catch (error) {
      console.error('Failed to fetch processes:', error);
      showSnackbar('공정 목록을 불러오는데 실패했습니다.', 'error');
    }
  }, [searchParams, paginationModel]);

  useEffect(() => {
    fetchProcesses();
  }, [fetchProcesses]);

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSearch = () => {
    setSearchParams({ ...inputValues });
    setPaginationModel({ ...paginationModel, page: 0 });
  };

  const handleInputChange = (field: string, value: string) => {
    setInputValues({ ...inputValues, [field]: value });
  };

  const handleOpenCreateDialog = () => {
    setDialogMode('create');
    resetProcessForm({
      processCode: '',
      processName: '',
      description: '',
      processType: '',
      equipmentIntegrationYn: 'N',
      status: 'ACTIVE',
      useYn: 'Y',
      sortOrder: 0,
    });
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (process: Process) => {
    setDialogMode('edit');
    resetProcessForm(process);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    resetProcessForm();
  };

  const handleSave = async (data: Process) => {
    try {
      if (dialogMode === 'create') {
        const result = await processService.createProcess(data);
        if (result.resultCode === 200) {
          showSnackbar('공정이 등록되었습니다.', 'success');
        } else {
          showSnackbar(result.result.message, 'error');
        }
      } else {
        await processService.updateProcess(data.processId!, data);
        showSnackbar('공정이 수정되었습니다.', 'success');
      }
      handleCloseDialog();
      fetchProcesses();
    } catch (error) {
      console.error('Failed to save process:', error);
      showSnackbar('저장에 실패했습니다.', 'error');
    }
  };

  const handleDelete = async (processId: string) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        await processService.deleteProcess(processId);
        showSnackbar('공정이 삭제되었습니다.', 'success');
        fetchProcesses();
      } catch (error) {
        console.error('Failed to delete process:', error);
        showSnackbar('삭제에 실패했습니다.', 'error');
      }
    }
  };

  const handleOpenDetailDialog = (process: Process) => {
    setSelectedProcess(process);
    setDetailTab(0);
    setOpenDetailDialog(true);
  };

  const handleCloseDetailDialog = () => {
    setOpenDetailDialog(false);
    setSelectedProcess(null);
  };

  const getStatusColor = (status: string) =>
    status === 'ACTIVE' ? 'success' : 'default';
  const getStatusLabel = (status: string) =>
    status === 'ACTIVE' ? '활성' : '비활성';

  const columns: GridColDef[] = [
    {
      field: 'processCode',
      headerName: '공정 코드',
      flex: 1,
      headerAlign: 'center',
    },
    {
      field: 'processName',
      headerName: '공정명',
      flex: 1.2,
      headerAlign: 'center',
    },
    {
      field: 'processType',
      headerName: '공정 타입',
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'equipmentIntegrationYn',
      headerName: '설비연동',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value === 'Y' ? '연동' : '미연동'}
          color={params.value === 'Y' ? 'primary' : 'default'}
          size="small"
        />
      ),
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
      field: 'sortOrder',
      headerName: '순서',
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
              title="불량코드 관리"
            >
              <BugReportIcon />
            </IconButton>
            <IconButton
              size="small"
              color="primary"
              onClick={() => {
                handleOpenDetailDialog(params.row);
                setDetailTab(1);
              }}
              title="검사항목 관리"
            >
              <CheckCircleIcon />
            </IconButton>
            <IconButton
              size="small"
              color="primary"
              onClick={() => {
                handleOpenDetailDialog(params.row);
                setDetailTab(2);
              }}
              title="중지항목 관리"
            >
              <PanToolIcon />
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
              onClick={() => handleDelete(params.row.processId!)}
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
          <Typography variant="h5">공정 관리</Typography>
        </Box>
      </Box>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>검색 조건</InputLabel>
            <Select
              value={inputValues.searchCnd}
              label="검색 조건"
              onChange={(e) => handleInputChange('searchCnd', e.target.value)}
            >
              <MenuItem value="0">공정 코드</MenuItem>
              <MenuItem value="1">공정명</MenuItem>
              <MenuItem value="2">공정 타입</MenuItem>
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
            <InputLabel>설비연동</InputLabel>
            <Select
              value={inputValues.equipmentIntegrationYn}
              label="설비연동"
              onChange={(e) =>
                handleInputChange('equipmentIntegrationYn', e.target.value)
              }
            >
              <MenuItem value="">전체</MenuItem>
              <MenuItem value="Y">연동</MenuItem>
              <MenuItem value="N">미연동</MenuItem>
            </Select>
          </FormControl>

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
            공정 등록
          </Button>
        </Stack>
      </Paper>

      <Paper sx={{ width: '100%' }}>
        <DataGrid
          rows={processes}
          columns={columns}
          getRowId={(row) => row.processId || ''}
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

      {/* 공정 등록/수정 다이얼로그 */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {dialogMode === 'create' ? '공정 등록' : '공정 수정'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Stack direction="row" spacing={2}>
              <Controller
                name="processCode"
                control={processControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    required
                    label="공정 코드"
                    disabled={dialogMode === 'edit'}
                    error={!!processErrors.processCode}
                    helperText={processErrors.processCode?.message}
                  />
                )}
              />
              <Controller
                name="processName"
                control={processControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    required
                    label="공정명"
                    error={!!processErrors.processName}
                    helperText={processErrors.processName?.message}
                  />
                )}
              />
            </Stack>
            <Stack direction="row" spacing={2}>
              <Controller
                name="processType"
                control={processControl}
                render={({ field }) => (
                  <TextField {...field} fullWidth label="공정 타입" />
                )}
              />
              <Controller
                name="sortOrder"
                control={processControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="정렬 순서"
                    type="number"
                    error={!!processErrors.sortOrder}
                    helperText={processErrors.sortOrder?.message}
                    onChange={(e) =>
                      field.onChange(parseInt(e.target.value) || 0)
                    }
                  />
                )}
              />
            </Stack>
            <Stack direction="row" spacing={2}>
              <Controller
                name="status"
                control={processControl}
                render={({ field }) => (
                  <FormControl fullWidth error={!!processErrors.status}>
                    <InputLabel>상태</InputLabel>
                    <Select {...field} label="상태">
                      <MenuItem value="ACTIVE">활성</MenuItem>
                      <MenuItem value="INACTIVE">비활성</MenuItem>
                    </Select>
                    {processErrors.status && (
                      <Typography
                        variant="caption"
                        color="error"
                        sx={{ mt: 0.5 }}
                      >
                        {processErrors.status.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
              <Controller
                name="useYn"
                control={processControl}
                render={({ field }) => (
                  <FormControl fullWidth error={!!processErrors.useYn}>
                    <InputLabel>사용 여부</InputLabel>
                    <Select {...field} label="사용 여부">
                      <MenuItem value="Y">사용</MenuItem>
                      <MenuItem value="N">미사용</MenuItem>
                    </Select>
                    {processErrors.useYn && (
                      <Typography
                        variant="caption"
                        color="error"
                        sx={{ mt: 0.5 }}
                      >
                        {processErrors.useYn.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
            </Stack>
            <Controller
              name="equipmentIntegrationYn"
              control={processControl}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={field.value === 'Y'}
                      onChange={(e) =>
                        field.onChange(e.target.checked ? 'Y' : 'N')
                      }
                    />
                  }
                  label="설비연동공정"
                />
              )}
            />
            <Controller
              name="description"
              control={processControl}
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
            onClick={handleProcessSubmit(handleSave)}
            variant="contained"
            color="primary"
          >
            저장
          </Button>
          <Button onClick={handleCloseDialog}>취소</Button>
        </DialogActions>
      </Dialog>

      {/* 공정 상세관리 다이얼로그 */}
      {selectedProcess && (
        <ProcessDetailDialog
          open={openDetailDialog}
          process={selectedProcess}
          onClose={handleCloseDetailDialog}
          detailTab={detailTab}
          setDetailTab={setDetailTab}
          showSnackbar={showSnackbar}
        />
      )}

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

// 공정 상세관리 다이얼로그 컴포넌트
interface ProcessDetailDialogProps {
  open: boolean;
  process: Process;
  onClose: () => void;
  detailTab: number;
  setDetailTab: (tab: number) => void;
  showSnackbar: (message: string, severity: 'success' | 'error') => void;
}

const ProcessDetailDialog: React.FC<ProcessDetailDialogProps> = ({
  open,
  process,
  onClose,
  detailTab,
  setDetailTab,
  showSnackbar,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>공정 상세 관리 - {process.processName}</DialogTitle>
      <DialogContent>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs
            value={detailTab}
            onChange={(e, newValue) => setDetailTab(newValue)}
          >
            <Tab
              label="불량코드 관리"
              icon={<BugReportIcon />}
              iconPosition="start"
            />
            <Tab
              label="검사항목 관리"
              icon={<CheckCircleIcon />}
              iconPosition="start"
            />
            <Tab
              label="중지항목 관리"
              icon={<PanToolIcon />}
              iconPosition="start"
            />
          </Tabs>
        </Box>
        {detailTab === 0 && (
          <ProcessDefectTab process={process} showSnackbar={showSnackbar} />
        )}
        {detailTab === 1 && (
          <ProcessInspectionTab process={process} showSnackbar={showSnackbar} />
        )}
        {detailTab === 2 && (
          <ProcessStopItemTab process={process} showSnackbar={showSnackbar} />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>닫기</Button>
      </DialogActions>
    </Dialog>
  );
};

// 불량코드 관리 탭
const ProcessDefectTab: React.FC<{
  process: Process;
  showSnackbar: (m: string, s: 'success' | 'error') => void;
}> = ({ process, showSnackbar }) => {
  // 권한 체크
  const { hasWritePermission } = usePermissions();
  const canWrite = hasWritePermission('/base/process');

  const [defects, setDefects] = useState<ProcessDefect[]>([]);
  const [defectCodes, setDefectCodes] = useState<CommonDetailCode[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');

  // react-hook-form 설정
  const {
    control: defectControl,
    handleSubmit: handleDefectSubmit,
    reset: resetDefectForm,
    setValue: setDefectValue,
    formState: { errors: defectErrors },
  } = useForm<ProcessDefect>({
    resolver: yupResolver(defectSchema),
    defaultValues: {
      processId: process.processId!,
      processDefectId: '',
      defectCode: '',
      defectName: '',
      defectType: '',
      description: '',
      useYn: 'Y',
    },
  });

  const fetchDefects = useCallback(async () => {
    try {
      const response = await processService.getProcessDefects(
        process.processId!
      );
      if (response.resultCode === 200 && response.result?.resultList) {
        setDefects(response.result.resultList);
      }
    } catch (error) {
      console.error('Failed to fetch defects:', error);
    }
  }, [process.processId]);

  const fetchDefectCodes = useCallback(async () => {
    try {
      const response = await commonCodeService.getCommonDetailCodeList(
        'COM003',
        'Y'
      );
      if (response.resultCode === 200 && response.result?.detailCodeList) {
        setDefectCodes(response.result.detailCodeList);
      }
    } catch (error) {
      console.error('Failed to fetch defect codes:', error);
    }
  }, []);

  useEffect(() => {
    fetchDefects();
    fetchDefectCodes();
  }, [fetchDefects, fetchDefectCodes]);

  const handleDefectCodeChange = (code: string) => {
    const selectedCode = defectCodes.find((dc) => dc.code === code);
    if (selectedCode) {
      setDefectValue('defectCode', selectedCode.code);
      setDefectValue('defectName', selectedCode.codeNm);
      setDefectValue('description', selectedCode.codeDc || '');
    } else {
      setDefectValue('defectCode', code);
    }
  };

  const handleSave = async (data: ProcessDefect) => {
    try {
      if (dialogMode === 'create') {
        await processService.addProcessDefect(process.processId!, data);
        showSnackbar('불량코드가 등록되었습니다.', 'success');
      } else {
        await processService.updateProcessDefect(
          process.processId!,
          data.processDefectId!,
          data
        );
        showSnackbar('불량코드가 수정되었습니다.', 'success');
      }
      setOpenDialog(false);
      resetDefectForm();
      fetchDefects();
    } catch (error) {
      console.error('Failed to save defect:', error);
      showSnackbar('저장에 실패했습니다.', 'error');
    }
  };

  const handleDelete = async (processDefectId: string) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        await processService.removeProcessDefect(
          process.processId!,
          processDefectId
        );
        showSnackbar('불량코드가 삭제되었습니다.', 'success');
        fetchDefects();
      } catch (error) {
        console.error('Failed to delete defect:', error);
        showSnackbar('삭제에 실패했습니다.', 'error');
      }
    }
  };

  const defectColumns: GridColDef[] = [
    {
      field: 'defectCode',
      headerName: '불량 코드',
      flex: 1,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'defectName',
      headerName: '불량명',
      flex: 1,
      // align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'defectType',
      headerName: '불량 타입',
      flex: 1,
      // align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'description',
      headerName: '설명',
      flex: 1.5,
      // align: 'center',
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
          <Stack direction="row" spacing={1}>
            <IconButton
              size="small"
              color="primary"
              onClick={() => {
                setDialogMode('edit');
                resetDefectForm(params.row);
                setOpenDialog(true);
              }}
              disabled={!canWrite}
            >
              <EditIcon />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDelete(params.row.processDefectId!)}
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
      <Card sx={{ mb: 2, bgcolor: '#f5f5f5' }}>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="subtitle2">불량코드 관리</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setDialogMode('create');
                resetDefectForm({
                  processId: process.processId!,
                  defectCode: '',
                  defectName: '',
                  defectType: '',
                  description: '',
                  useYn: 'Y',
                });
                setOpenDialog(true);
              }}
              disabled={!canWrite}
            >
              불량코드 추가
            </Button>
          </Stack>
        </CardContent>
      </Card>
      <Paper sx={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={defects}
          columns={defectColumns}
          getRowId={(row) => row.processDefectId || ''}
          hideFooterPagination
          disableRowSelectionOnClick
          localeText={{ noRowsLabel: '등록된 불량코드가 없습니다' }}
        />
      </Paper>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {dialogMode === 'create' ? '불량코드 등록' : '불량코드 수정'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Controller
              name="defectCode"
              control={defectControl}
              render={({ field }) => (
                <FormControl
                  fullWidth
                  required
                  error={!!defectErrors.defectCode}
                >
                  <InputLabel>불량코드</InputLabel>
                  <Select
                    {...field}
                    label="불량코드"
                    onChange={(e) => {
                      field.onChange(e);
                      handleDefectCodeChange(e.target.value);
                    }}
                    disabled={dialogMode === 'edit'}
                  >
                    {defectCodes.map((code) => (
                      <MenuItem key={code.code} value={code.code}>
                        {code.codeNm} ({code.code})
                      </MenuItem>
                    ))}
                  </Select>
                  {defectErrors.defectCode && (
                    <Typography
                      variant="caption"
                      color="error"
                      sx={{ mt: 0.5 }}
                    >
                      {defectErrors.defectCode.message}
                    </Typography>
                  )}
                </FormControl>
              )}
            />
            <Controller
              name="defectName"
              control={defectControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  required
                  label="불량명"
                  disabled
                  error={!!defectErrors.defectName}
                  helperText={defectErrors.defectName?.message}
                />
              )}
            />
            <Controller
              name="defectType"
              control={defectControl}
              render={({ field }) => (
                <TextField {...field} fullWidth label="불량 타입" />
              )}
            />
            <Controller
              name="description"
              control={defectControl}
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
          <Button onClick={handleDefectSubmit(handleSave)} variant="contained">
            저장
          </Button>
          <Button onClick={() => setOpenDialog(false)}>취소</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// 검사항목 관리 탭
const ProcessInspectionTab: React.FC<{
  process: Process;
  showSnackbar: (m: string, s: 'success' | 'error') => void;
}> = ({ process, showSnackbar }) => {
  // 권한 체크
  const { hasWritePermission } = usePermissions();
  const canWrite = hasWritePermission('/base/process');

  const [inspections, setInspections] = useState<ProcessInspection[]>([]);
  const [inspectionCodes, setInspectionCodes] = useState<CommonDetailCode[]>(
    []
  );
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');

  // react-hook-form 설정
  const {
    control: inspectionControl,
    handleSubmit: handleInspectionSubmit,
    reset: resetInspectionForm,
    setValue: setInspectionValue,
    formState: { errors: inspectionErrors },
  } = useForm<ProcessInspection>({
    resolver: yupResolver(inspectionSchema),
    defaultValues: {
      processId: process.processId!,
      processInspectionId: '',
      inspectionCode: '',
      inspectionName: '',
      inspectionType: '',
      standardValue: '',
      upperLimit: undefined,
      lowerLimit: undefined,
      unit: '',
      description: '',
      useYn: 'Y',
    },
  });

  const fetchInspections = useCallback(async () => {
    try {
      const response = await processService.getProcessInspections(
        process.processId!
      );
      if (response.resultCode === 200 && response.result?.resultList) {
        setInspections(response.result.resultList);
      }
    } catch (error) {
      console.error('Failed to fetch inspections:', error);
    }
  }, [process.processId]);

  const fetchInspectionCodes = useCallback(async () => {
    try {
      const response = await commonCodeService.getCommonDetailCodeList(
        'COM004',
        'Y'
      );
      if (response.resultCode === 200 && response.result?.detailCodeList) {
        setInspectionCodes(response.result.detailCodeList);
      }
    } catch (error) {
      console.error('Failed to fetch inspection codes:', error);
    }
  }, []);

  useEffect(() => {
    fetchInspections();
    fetchInspectionCodes();
  }, [fetchInspections, fetchInspectionCodes]);

  const handleInspectionCodeChange = (code: string) => {
    const selectedCode = inspectionCodes.find((ic) => ic.code === code);
    if (selectedCode) {
      setInspectionValue('inspectionCode', selectedCode.code);
      setInspectionValue('inspectionName', selectedCode.codeNm);
      setInspectionValue('description', selectedCode.codeDc || '');
    } else {
      setInspectionValue('inspectionCode', code);
    }
  };

  const handleSave = async (data: ProcessInspection) => {
    try {
      if (dialogMode === 'create') {
        await processService.addProcessInspection(process.processId!, data);
        showSnackbar('검사항목이 등록되었습니다.', 'success');
      } else {
        await processService.updateProcessInspection(
          process.processId!,
          data.processInspectionId!,
          data
        );
        showSnackbar('검사항목이 수정되었습니다.', 'success');
      }
      setOpenDialog(false);
      resetInspectionForm();
      fetchInspections();
    } catch (error) {
      console.error('Failed to save inspection:', error);
      showSnackbar('저장에 실패했습니다.', 'error');
    }
  };

  const handleDelete = async (processInspectionId: string) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        await processService.removeProcessInspection(
          process.processId!,
          processInspectionId
        );
        showSnackbar('검사항목이 삭제되었습니다.', 'success');
        fetchInspections();
      } catch (error) {
        console.error('Failed to delete inspection:', error);
        showSnackbar('삭제에 실패했습니다.', 'error');
      }
    }
  };

  const inspectionColumns: GridColDef[] = [
    {
      field: 'inspectionCode',
      headerName: '검사 코드',
      flex: 1,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'inspectionName',
      headerName: '검사항목명',
      flex: 1.2,
      // align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'inspectionType',
      headerName: '검사 타입',
      flex: 1,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'standardValue',
      headerName: '기준값',
      flex: 1,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'upperLimit',
      headerName: '상한',
      flex: 0.7,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'lowerLimit',
      headerName: '하한',
      flex: 0.7,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'unit',
      headerName: '단위',
      flex: 0.7,
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
          <Stack direction="row" spacing={1}>
            <IconButton
              size="small"
              color="primary"
              onClick={() => {
                setDialogMode('edit');
                resetInspectionForm(params.row);
                setOpenDialog(true);
              }}
              disabled={!canWrite}
            >
              <EditIcon />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDelete(params.row.processInspectionId!)}
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
      <Card sx={{ mb: 2, bgcolor: '#f5f5f5' }}>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="subtitle2">검사항목 관리</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setDialogMode('create');
                resetInspectionForm({
                  processId: process.processId!,
                  inspectionCode: '',
                  inspectionName: '',
                  inspectionType: '',
                  standardValue: '',
                  upperLimit: undefined,
                  lowerLimit: undefined,
                  unit: '',
                  description: '',
                  useYn: 'Y',
                });
                setOpenDialog(true);
              }}
              disabled={!canWrite}
            >
              검사항목 추가
            </Button>
          </Stack>
        </CardContent>
      </Card>
      <Paper sx={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={inspections}
          columns={inspectionColumns}
          getRowId={(row) => row.processInspectionId || ''}
          hideFooterPagination
          disableRowSelectionOnClick
          localeText={{ noRowsLabel: '등록된 검사항목이 없습니다' }}
        />
      </Paper>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {dialogMode === 'create' ? '검사항목 등록' : '검사항목 수정'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Stack direction="row" spacing={2}>
              <Controller
                name="inspectionCode"
                control={inspectionControl}
                render={({ field }) => (
                  <FormControl
                    fullWidth
                    required
                    error={!!inspectionErrors.inspectionCode}
                  >
                    <InputLabel>검사코드</InputLabel>
                    <Select
                      {...field}
                      label="검사코드"
                      onChange={(e) => {
                        field.onChange(e);
                        handleInspectionCodeChange(e.target.value);
                      }}
                      disabled={dialogMode === 'edit'}
                    >
                      {inspectionCodes.map((code) => (
                        <MenuItem key={code.code} value={code.code}>
                          {code.codeNm} ({code.code})
                        </MenuItem>
                      ))}
                    </Select>
                    {inspectionErrors.inspectionCode && (
                      <Typography
                        variant="caption"
                        color="error"
                        sx={{ mt: 0.5 }}
                      >
                        {inspectionErrors.inspectionCode.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
              <Controller
                name="inspectionName"
                control={inspectionControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    required
                    label="검사항목명"
                    disabled
                    error={!!inspectionErrors.inspectionName}
                    helperText={inspectionErrors.inspectionName?.message}
                  />
                )}
              />
            </Stack>
            <Stack direction="row" spacing={2}>
              <Controller
                name="inspectionType"
                control={inspectionControl}
                render={({ field }) => (
                  <TextField {...field} fullWidth label="검사 타입" />
                )}
              />
              <Controller
                name="standardValue"
                control={inspectionControl}
                render={({ field }) => (
                  <TextField {...field} fullWidth label="기준값" />
                )}
              />
            </Stack>
            <Stack direction="row" spacing={2}>
              <Controller
                name="upperLimit"
                control={inspectionControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="상한값"
                    type="number"
                    value={field.value || ''}
                    onChange={(e) =>
                      field.onChange(parseFloat(e.target.value) || undefined)
                    }
                  />
                )}
              />
              <Controller
                name="lowerLimit"
                control={inspectionControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="하한값"
                    type="number"
                    value={field.value || ''}
                    onChange={(e) =>
                      field.onChange(parseFloat(e.target.value) || undefined)
                    }
                  />
                )}
              />
              <Controller
                name="unit"
                control={inspectionControl}
                render={({ field }) => (
                  <TextField {...field} fullWidth label="단위" />
                )}
              />
            </Stack>
            <Controller
              name="description"
              control={inspectionControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  multiline
                  rows={3}
                  label="설명"
                  disabled
                />
              )}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleInspectionSubmit(handleSave)}
            variant="contained"
          >
            저장
          </Button>
          <Button onClick={() => setOpenDialog(false)}>취소</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// 중지항목 관리 탭
const ProcessStopItemTab: React.FC<{
  process: Process;
  showSnackbar: (m: string, s: 'success' | 'error') => void;
}> = ({ process, showSnackbar }) => {
  // 권한 체크
  const { hasWritePermission } = usePermissions();
  const canWrite = hasWritePermission('/base-data/process');

  const [stopItems, setStopItems] = useState<ProcessStopItem[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');

  // react-hook-form 설정
  const {
    control: stopItemControl,
    handleSubmit: handleStopItemSubmit,
    reset: resetStopItemForm,
    formState: { errors: stopItemErrors },
  } = useForm<ProcessStopItem>({
    resolver: yupResolver(stopItemSchema),
    defaultValues: {
      processId: process.processId!,
      processStopItemId: '',
      stopItemCode: '',
      stopItemName: '',
      stopType: '',
      description: '',
      useYn: 'Y',
    },
  });

  const fetchStopItems = useCallback(async () => {
    try {
      const response = await processService.getProcessStopItems(
        process.processId!
      );
      if (response.resultCode === 200 && response.result?.resultList) {
        setStopItems(response.result.resultList);
      }
    } catch (error) {
      console.error('Failed to fetch stop items:', error);
    }
  }, [process.processId]);

  useEffect(() => {
    fetchStopItems();
  }, [fetchStopItems]);

  const handleSave = async (data: ProcessStopItem) => {
    try {
      if (dialogMode === 'create') {
        await processService.addProcessStopItem(process.processId!, data);
        showSnackbar('중지항목이 등록되었습니다.', 'success');
      } else {
        await processService.updateProcessStopItem(
          process.processId!,
          data.processStopItemId!,
          data
        );
        showSnackbar('중지항목이 수정되었습니다.', 'success');
      }
      setOpenDialog(false);
      resetStopItemForm();
      fetchStopItems();
    } catch (error) {
      console.error('Failed to save stop item:', error);
      showSnackbar('저장에 실패했습니다.', 'error');
    }
  };

  const handleDelete = async (processStopItemId: string) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        await processService.removeProcessStopItem(
          process.processId!,
          processStopItemId
        );
        showSnackbar('중지항목이 삭제되었습니다.', 'success');
        fetchStopItems();
      } catch (error) {
        console.error('Failed to delete stop item:', error);
        showSnackbar('삭제에 실패했습니다.', 'error');
      }
    }
  };

  const stopItemColumns: GridColDef[] = [
    {
      field: 'stopItemCode',
      headerName: '중지항목 코드',
      flex: 1,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'stopItemName',
      headerName: '중지항목명',
      flex: 1.2,
      headerAlign: 'center',
    },
    {
      field: 'stopType',
      headerName: '중지 타입',
      flex: 1,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'description',
      headerName: '설명',
      flex: 1.5,
      headerAlign: 'center',
    },
    {
      field: 'useYn',
      headerName: '사용여부',
      flex: 0.7,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value === 'Y' ? '사용' : '미사용'}
          color={params.value === 'Y' ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    {
      field: 'actions',
      headerName: '관리',
      flex: 0.8,
      align: 'center',
      headerAlign: 'center',
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <IconButton
            size="small"
            color="primary"
            onClick={() => {
              setDialogMode('edit');
              resetStopItemForm(params.row);
              setOpenDialog(true);
            }}
            disabled={!canWrite}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => handleDelete(params.row.processStopItemId!)}
            disabled={!canWrite}
          >
            <DeleteIcon />
          </IconButton>
        </Stack>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">중지항목 목록</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setDialogMode('create');
            resetStopItemForm({
              processId: process.processId!,
              processStopItemId: '',
              stopItemCode: '',
              stopItemName: '',
              stopType: '',
              description: '',
              useYn: 'Y',
            });
            setOpenDialog(true);
          }}
          disabled={!canWrite}
        >
          등록
        </Button>
      </Box>

      <DataGrid
        rows={stopItems}
        columns={stopItemColumns}
        getRowId={(row) => row.processStopItemId!}
        autoHeight
        disableRowSelectionOnClick
        initialState={{
          pagination: {
            paginationModel: { pageSize: 10 },
          },
        }}
        pageSizeOptions={[5, 10, 25]}
      />

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>
          {dialogMode === 'create' ? '중지항목 등록' : '중지항목 수정'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <Controller
              name="stopItemCode"
              control={stopItemControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="중지항목 코드"
                  error={!!stopItemErrors.stopItemCode}
                  helperText={stopItemErrors.stopItemCode?.message}
                  required
                />
              )}
            />
            <Controller
              name="stopItemName"
              control={stopItemControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="중지항목명"
                  error={!!stopItemErrors.stopItemName}
                  helperText={stopItemErrors.stopItemName?.message}
                  required
                />
              )}
            />
            <Controller
              name="stopType"
              control={stopItemControl}
              render={({ field }) => (
                <TextField {...field} fullWidth label="중지 타입" />
              )}
            />
            <Controller
              name="description"
              control={stopItemControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="설명"
                  multiline
                  rows={3}
                />
              )}
            />
            <Controller
              name="useYn"
              control={stopItemControl}
              render={({ field }) => (
                <FormControlLabel
                  control={<Checkbox checked={field.value === 'Y'} />}
                  label="사용"
                  onChange={(e, checked) => field.onChange(checked ? 'Y' : 'N')}
                />
              )}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleStopItemSubmit(handleSave)}
            variant="contained"
          >
            저장
          </Button>
          <Button onClick={() => setOpenDialog(false)}>취소</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProcessManagement;
