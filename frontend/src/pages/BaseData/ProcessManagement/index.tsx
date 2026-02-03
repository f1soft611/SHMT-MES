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
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  BugReport as BugReportIcon,
  CheckCircle as CheckCircleIcon,
  PanTool as PanToolIcon,
  PrecisionManufacturing as PrecisionManufacturingIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Process } from '../../../types/process';
import processService from '../../../services/processService';
import commonCodeService from '../../../services/commonCodeService';
import { usePermissions } from '../../../contexts/PermissionContext';
import ProcessDetailDialog from './components/ProcessDetailDialog';
import DataTable from '../../../components/common/DataTable/DataTable';
import PageHeader from '../../../components/common/PageHeader/PageHeader';
import { useToast } from '../../../components/common/Feedback/ToastProvider';

// 공정 등록 유효성 검사 스키마
const processSchema: yup.ObjectSchema<Process> = yup.object({
  processId: yup.string(),
  processCode: yup.string(),
  processName: yup.string().required('공정명은 필수입니다.'),
  description: yup.string(),
  processType: yup.string(),
  erpProcessMapping: yup.string(),
  equipmentIntegrationYn: yup.string().required('설비연동 여부는 필수입니다.'),
  status: yup.string().required('상태는 필수입니다.'),
  useYn: yup.string().required('사용 여부는 필수입니다.'),
  sortOrder: yup
    .number()
    .required('순서는 필수입니다.')
    .min(0, '순서는 0 이상이어야 합니다.'),
});

const ProcessManagement: React.FC = () => {
  // 권한 체크
  const { hasWritePermission } = usePermissions();
  const canWrite = hasWritePermission('/base/process');

  // 페이지 로드 시 권한 새로고침
  // useEffect(() => {
  //   const refreshPerms = async () => {
  //     await refreshPermissions();
  //   };
  //   refreshPerms();
  // }, [refreshPermissions]);

  const [processes, setProcesses] = useState<Process[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedProcess, setSelectedProcess] = useState<Process | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [detailTab, setDetailTab] = useState(0);
  const [erpProcessCodes, setErpProcessCodes] = useState<
    Array<{ code: string; codeNm: string }>
  >([]);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const { showToast } = useToast();

  // react-hook-form 설정 - 공정
  const {
    control: processControl,
    handleSubmit: handleProcessSubmit,
    reset: resetProcessForm,
    setValue: processSetValue,
    formState: { errors: processErrors },
  } = useForm<Process>({
    resolver: yupResolver(processSchema),
    defaultValues: {
      processCode: '',
      processName: '',
      description: '',
      processType: '',
      erpProcessMapping: '',
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
        searchParams,
      );
      if (response.resultCode === 200 && response.result?.resultList) {
        setProcesses(response.result.resultList);
        setTotalCount(parseInt(response.result.resultCnt || '0'));
      }
    } catch (error) {
      console.error('Failed to fetch processes:', error);
      showToast({
        message: '공정 목록을 불러오는데 실패했습니다.',
        severity: 'error',
      });
    }
  }, [searchParams, paginationModel, showToast]);

  useEffect(() => {
    fetchProcesses();
  }, [fetchProcesses]);

  // ERP 공정 코드 로드 (com008)
  useEffect(() => {
    const loadErpProcessCodes = async () => {
      try {
        const response = await commonCodeService.getCommonDetailCodeList(
          'COM008',
          'Y',
        );

        // result가 배열인지 확인
        if (response.resultCode === 200 && response.result) {
          // result가 직접 배열인 경우
          if (Array.isArray(response.result)) {
            setErpProcessCodes(response.result);
          }
          // result.resultList가 있는 경우
          else if (
            response.result.detailCodeList &&
            Array.isArray(response.result.detailCodeList)
          ) {
            setErpProcessCodes(response.result.detailCodeList);
          } else {
            console.warn('Unknown response structure:', response);
            showToast({
              message:
                'ERP 공정 코드를 불러오지 못했습니다. COM008 공통코드를 확인해주세요.',
              severity: 'warning',
            });
          }
        } else {
          console.warn('Failed to load ERP process codes:', response);
          showToast({
            message:
              'ERP 공정 코드를 불러오지 못했습니다. com008 공통코드를 확인해주세요.',
            severity: 'warning',
          });
        }
      } catch (error) {
        console.error('Failed to fetch ERP process codes:', error);
        showToast({
          message: 'ERP 공정 코드 조회 중 오류가 발생했습니다.',
          severity: 'error',
        });
      }
    };
    loadErpProcessCodes();
  }, [showToast]);

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
      erpProcessMapping: '',
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
      // 공정 코드가 입력되지 않았으면 공정ID를 사용
      if (!data.processCode && data.processId) {
        data.processCode = data.processId;
      }

      if (dialogMode === 'create') {
        const result = await processService.createProcess(data);
        if (result.resultCode === 200) {
          showToast({ message: '공정이 등록되었습니다.', severity: 'success' });
        } else {
          showToast({ message: result.result.message, severity: 'error' });
        }
      } else {
        await processService.updateProcess(data.processId!, data);
        showToast({ message: '공정이 수정되었습니다.', severity: 'success' });
      }
      handleCloseDialog();
      fetchProcesses();
    } catch (error) {
      console.error('Failed to save process:', error);
      showToast({ message: '저장에 실패했습니다.', severity: 'error' });
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
      align: 'center',
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
      width: 220,
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
              <BugReportIcon fontSize="small" />
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
              <CheckCircleIcon fontSize="small" />
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
              <PanToolIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              color="primary"
              onClick={() => {
                handleOpenDetailDialog(params.row);
                setDetailTab(3);
              }}
              title="설비 관리"
            >
              <PrecisionManufacturingIcon fontSize="small" />
            </IconButton>
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
              onClick={() => handleDelete(params.row.processId!)}
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
        crumbs={[{ label: '기준정보' }, { label: '공정 관리' }]}
      />

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

      <Paper>
        <DataTable
          rows={processes}
          columns={columns}
          getRowId={(row) => row.processId || ''}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          rowCount={totalCount}
          loading={false}
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
        <DialogContent dividers={true}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Stack direction="row" spacing={2}>
              <Controller
                name="processCode"
                control={processControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="공정 코드 (미입력시 공정ID 자동설정)"
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
                name="erpProcessMapping"
                control={processControl}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>ERP 공정 매핑</InputLabel>
                    <Select
                      {...field}
                      label="ERP 공정 매핑"
                      onChange={(e) => {
                        field.onChange(e);
                        // ERP 공정 선택 시 MES 공정명을 ERP 공정명으로 변경
                        const selectedCode = erpProcessCodes.find(
                          (code) => code.code === e.target.value,
                        );
                        if (selectedCode && selectedCode.codeNm) {
                          processSetValue('processName', selectedCode.codeNm);
                        }
                      }}
                    >
                      <MenuItem value="">선택 없음</MenuItem>
                      {erpProcessCodes.map((code) => (
                        <MenuItem key={code.code} value={code.code}>
                          {code.codeNm}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Stack>
            <Stack direction="row" spacing={2}>
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
          showSnackbar={(message, severity) => showToast({ message, severity })}
        />
      )}
    </Box>
  );
};

export default ProcessManagement;
