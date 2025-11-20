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
  Tabs,
  Tab,
} from '@mui/material';
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Code as CodeIcon,
  List as ListIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { CommonCode } from '../../../types/commonCode';
import commonCodeService from '../../../services/commonCodeService';
import { usePermissions } from '../../../contexts/PermissionContext';
import DetailCodeTab from './components/DetailCodeTab';

// 공통코드 등록 유효성 검사 스키마
const commonCodeSchema: yup.ObjectSchema<CommonCode> = yup.object({
  codeId: yup.string().required('코드 ID는 필수입니다.'),
  codeIdNm: yup.string().required('코드명은 필수입니다.'),
  codeIdDc: yup.string(),
  clCode: yup.string(),
  useAt: yup
    .mixed<'Y' | 'N'>()
    .oneOf(['Y', 'N'])
    .required('사용여부는 필수입니다.'),
});

const CommonCodeManagement: React.FC = () => {
  // 권한 체크
  const { hasWritePermission } = usePermissions();
  const canWrite = hasWritePermission('/base/common-code');
  const [commonCodes, setCommonCodes] = useState<CommonCode[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedCommonCode, setSelectedCommonCode] =
    useState<CommonCode | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [currentTab, setCurrentTab] = useState(0);
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

  // react-hook-form 설정 - 공통코드
  const {
    control: commonCodeControl,
    handleSubmit: handleCommonCodeSubmit,
    reset: resetCommonCodeForm,
    formState: { errors: commonCodeErrors },
  } = useForm<CommonCode>({
    resolver: yupResolver(commonCodeSchema),
    defaultValues: {
      codeId: '',
      codeIdNm: '',
      codeIdDc: '',
      clCode: 'LET',
      useAt: 'Y',
    },
  });

  // 실제 검색에 사용되는 파라미터
  const [searchParams, setSearchParams] = useState({
    searchCnd: '1',
    searchWrd: '',
    useAt: '',
  });

  // 입력 필드용 상태 (화면 입력용)
  const [inputValues, setInputValues] = useState({
    searchCnd: '1',
    searchWrd: '',
    useAt: '',
  });

  // 공통코드 목록 조회
  const fetchCommonCodes = useCallback(async () => {
    try {
      const response = await commonCodeService.getCommonCodeList(
        paginationModel.page,
        paginationModel.pageSize,
        searchParams
      );
      if (response.resultCode === 200 && response.result?.resultList) {
        setCommonCodes(response.result.resultList);
        setTotalCount(parseInt(response.result.resultCnt || '0'));
      }
    } catch (error) {
      console.error('Failed to fetch common codes:', error);
      showSnackbar('공통코드 목록을 불러오는데 실패했습니다.', 'error');
    }
  }, [searchParams, paginationModel]);

  useEffect(() => {
    fetchCommonCodes();
  }, [fetchCommonCodes]);

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
    resetCommonCodeForm({
      codeId: '',
      codeIdNm: '',
      codeIdDc: '',
      clCode: 'LET',
      useAt: 'Y',
    });
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (commonCode: CommonCode) => {
    setDialogMode('edit');
    resetCommonCodeForm(commonCode);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    resetCommonCodeForm();
  };

  const handleSave = async (data: CommonCode) => {
    try {
      if (dialogMode === 'create') {
        const result = await commonCodeService.createCommonCode(data);
        if (result.resultCode === 200) {
          showSnackbar('공통코드가 등록되었습니다.', 'success');
        } else {
          showSnackbar(result.result.message, 'error');
        }
      } else {
        await commonCodeService.updateCommonCode(data.codeId!, data);
        showSnackbar('공통코드가 수정되었습니다.', 'success');
      }
      handleCloseDialog();
      fetchCommonCodes();
    } catch (error) {
      console.error('Failed to save common code:', error);
      showSnackbar('저장에 실패했습니다.', 'error');
    }
  };

  const handleDelete = async (codeId: string) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        await commonCodeService.deleteCommonCode(codeId);
        showSnackbar('공통코드가 삭제되었습니다.', 'success');
        fetchCommonCodes();
      } catch (error) {
        console.error('Failed to delete common code:', error);
        showSnackbar('삭제에 실패했습니다.', 'error');
      }
    }
  };

  // 상세 코드 관련 핸들러
  const handleViewDetails = (commonCode: CommonCode) => {
    setSelectedCommonCode(commonCode);
    setCurrentTab(1);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const columns: GridColDef[] = [
    {
      field: 'codeId',
      headerName: '코드 ID',
      flex: 1,
      minWidth: 120,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'codeIdNm',
      headerName: '코드명',
      flex: 1.5,
      minWidth: 150,
      headerAlign: 'center',
    },
    {
      field: 'codeIdDc',
      headerName: '설명',
      flex: 2,
      minWidth: 200,
      headerAlign: 'center',
    },
    {
      field: 'clCode',
      headerName: '분류코드',
      flex: 1,
      minWidth: 100,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'useAt',
      headerName: '사용여부',
      flex: 0.5,
      minWidth: 80,
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
      headerName: '작업',
      flex: 1,
      minWidth: 200,
      sortable: false,
      align: 'center',
      headerAlign: 'center',
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
              onClick={() => handleViewDetails(params.row)}
            >
              <SearchIcon />
            </IconButton>
            <IconButton
              size="small"
              color="primary"
              onClick={() => handleOpenEditDialog(params.row)}
              disabled={!canWrite}
            >
              <EditIcon />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDelete(params.row.codeId)}
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
          <Typography variant="h5">공통코드 관리</Typography>
        </Box>
      </Box>

      {/* 공통코드 탭 */}
      {currentTab === 0 && (
        <>
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
                  label="검색조건"
                  onChange={(e) =>
                    handleInputChange('searchCnd', e.target.value)
                  }
                >
                  <MenuItem value="0">코드 ID</MenuItem>
                  <MenuItem value="1">코드명</MenuItem>
                  <MenuItem value="2">설명</MenuItem>
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
                <InputLabel>사용여부</InputLabel>
                <Select
                  value={inputValues.useAt}
                  label="사용여부"
                  onChange={(e) => handleInputChange('useAt', e.target.value)}
                >
                  <MenuItem value="">전체</MenuItem>
                  <MenuItem value="Y">사용</MenuItem>
                  <MenuItem value="N">미사용</MenuItem>
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
                공통코드 등록
              </Button>
            </Stack>
          </Paper>

          <Paper sx={{ width: '100%' }}>
            <Tabs value={currentTab} onChange={handleTabChange} sx={{ mb: 2 }}>
              <Tab icon={<CodeIcon />} label="공통코드" iconPosition="start" />
              <Tab
                icon={<ListIcon />}
                label={`상세코드${
                  selectedCommonCode ? ` (${selectedCommonCode.codeIdNm})` : ''
                }`}
                iconPosition="start"
                disabled={!selectedCommonCode}
              />
            </Tabs>
          </Paper>

          <Paper>
            <DataGrid
              rows={commonCodes}
              columns={columns}
              getRowId={(row) => row.codeId}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              pageSizeOptions={[10, 20, 50]}
              rowCount={totalCount}
              paginationMode="server"
              disableRowSelectionOnClick
              autoHeight
              sx={{
                '& .MuiDataGrid-cell:focus': {
                  outline: 'none',
                },
                '& .MuiDataGrid-row:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            />
          </Paper>
        </>
      )}

      {/* 상세코드 탭 */}
      {currentTab === 1 && selectedCommonCode && (
        <>
          <Paper sx={{ width: '100%' }}>
            <Tabs value={currentTab} onChange={handleTabChange} sx={{ mb: 2 }}>
              <Tab icon={<CodeIcon />} label="공통코드" iconPosition="start" />
              <Tab
                icon={<ListIcon />}
                label={`상세코드${
                  selectedCommonCode ? ` (${selectedCommonCode.codeIdNm})` : ''
                }`}
                iconPosition="start"
                disabled={!selectedCommonCode}
              />
            </Tabs>
          </Paper>

          <DetailCodeTab
            commonCode={selectedCommonCode}
            showSnackbar={showSnackbar}
          />
        </>
      )}

      {/* 공통코드 등록/수정 다이얼로그 */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {dialogMode === 'create' ? '공통코드 등록' : '공통코드 수정'}
        </DialogTitle>
        <DialogContent dividers={true}>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <Controller
              name="codeId"
              control={commonCodeControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="코드 ID"
                  fullWidth
                  required
                  disabled={dialogMode === 'edit'}
                  error={!!commonCodeErrors.codeId}
                  helperText={commonCodeErrors.codeId?.message}
                />
              )}
            />
            <Controller
              name="codeIdNm"
              control={commonCodeControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="코드명"
                  fullWidth
                  required
                  error={!!commonCodeErrors.codeIdNm}
                  helperText={commonCodeErrors.codeIdNm?.message}
                />
              )}
            />
            <Controller
              name="codeIdDc"
              control={commonCodeControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="설명"
                  fullWidth
                  multiline
                  rows={3}
                />
              )}
            />
            <Controller
              name="clCode"
              control={commonCodeControl}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>분류코드</InputLabel>
                  <Select {...field} label="분류코드">
                    <MenuItem value="LET">LET</MenuItem>
                    {/* 필요한 다른 분류코드 옵션 추가 */}
                  </Select>
                </FormControl>
              )}
            />
            <Controller
              name="useAt"
              control={commonCodeControl}
              render={({ field }) => (
                <FormControl fullWidth error={!!commonCodeErrors.useAt}>
                  <InputLabel>사용여부</InputLabel>
                  <Select {...field} label="사용여부">
                    <MenuItem value="Y">사용</MenuItem>
                    <MenuItem value="N">미사용</MenuItem>
                  </Select>
                  {commonCodeErrors.useAt && (
                    <Typography
                      variant="caption"
                      color="error"
                      sx={{ mt: 0.5 }}
                    >
                      {commonCodeErrors.useAt.message}
                    </Typography>
                  )}
                </FormControl>
              )}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCommonCodeSubmit(handleSave)}
            variant="contained"
            color="primary"
          >
            저장
          </Button>
          <Button onClick={handleCloseDialog}>취소</Button>
        </DialogActions>
      </Dialog>

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

export default CommonCodeManagement;
