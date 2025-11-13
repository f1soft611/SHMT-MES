import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
  Chip,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { CommonCode, CommonDetailCode } from '../../../../types/commonCode';
import commonCodeService from '../../../../services/commonCodeService';
import { usePermissions } from '../../../../contexts/PermissionContext';

// 상세코드 등록 유효성 검사 스키마
const detailCodeSchema: yup.ObjectSchema<CommonDetailCode> = yup.object({
  codeId: yup.string().required('코드는 필수입니다.'),
  code: yup.string().required('코드는 필수입니다.'),
  codeNm: yup.string().required('코드명은 필수입니다.'),
  codeDc: yup.string(),
  useAt: yup
    .mixed<'Y' | 'N'>()
    .oneOf(['Y', 'N'])
    .required('사용여부는 필수입니다.'),
});

interface DetailCodeTabProps {
  commonCode: CommonCode;
  showSnackbar: (message: string, severity: 'success' | 'error') => void;
}

const DetailCodeTab: React.FC<DetailCodeTabProps> = ({
  commonCode,
  showSnackbar,
}) => {
  // 권한 체크
  const { hasWritePermission } = usePermissions();
  const canWrite = hasWritePermission('/base/common-code');

  const [detailCodes, setDetailCodes] = useState<CommonDetailCode[]>([]);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [detailDialogMode, setDetailDialogMode] = useState<'create' | 'edit'>(
    'create'
  );

  // react-hook-form 설정 - 상세코드
  const {
    control: detailCodeControl,
    handleSubmit: handleDetailCodeSubmit,
    reset: resetDetailCodeForm,
    formState: { errors: detailCodeErrors },
  } = useForm<CommonDetailCode>({
    resolver: yupResolver(detailCodeSchema),
    defaultValues: {
      codeId: commonCode.codeId,
      code: '',
      codeNm: '',
      codeDc: '',
      useAt: 'Y',
    },
  });

  // 상세 코드 목록 조회
  const fetchDetailCodes = useCallback(async () => {
    try {
      const response = await commonCodeService.getCommonDetailCodeList(
        commonCode.codeId
      );
      if (response.resultCode === 200 && response.result?.detailCodeList) {
        setDetailCodes(response.result.detailCodeList);
      }
    } catch (error) {
      console.error('Failed to fetch detail codes:', error);
      showSnackbar('상세 코드 목록을 불러오는데 실패했습니다.', 'error');
    }
  }, [commonCode.codeId, showSnackbar]);

  useEffect(() => {
    fetchDetailCodes();
  }, [fetchDetailCodes]);

  const handleOpenCreateDetailDialog = () => {
    setDetailDialogMode('create');
    resetDetailCodeForm({
      codeId: commonCode.codeId,
      code: '',
      codeNm: '',
      codeDc: '',
      useAt: 'Y',
    });
    setOpenDetailDialog(true);
  };

  const handleOpenEditDetailDialog = (detailCode: CommonDetailCode) => {
    setDetailDialogMode('edit');
    resetDetailCodeForm(detailCode);
    setOpenDetailDialog(true);
  };

  const handleCloseDetailDialog = () => {
    setOpenDetailDialog(false);
    resetDetailCodeForm();
  };

  const handleSaveDetail = async (data: CommonDetailCode) => {
    try {
      if (detailDialogMode === 'create') {
        const result = await commonCodeService.createCommonDetailCode(
          data.codeId,
          data
        );
        if (result.resultCode === 200) {
          showSnackbar('상세 코드가 등록되었습니다.', 'success');
        } else {
          showSnackbar(result.result.message, 'error');
        }
      } else {
        await commonCodeService.updateCommonDetailCode(
          data.codeId,
          data.code,
          data
        );
        showSnackbar('상세 코드가 수정되었습니다.', 'success');
      }
      handleCloseDetailDialog();
      fetchDetailCodes();
    } catch (error) {
      console.error('Failed to save detail code:', error);
      showSnackbar('저장에 실패했습니다.', 'error');
    }
  };

  const handleDeleteDetail = async (codeId: string, code: string) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        await commonCodeService.deleteCommonDetailCode(codeId, code);
        showSnackbar('상세 코드가 삭제되었습니다.', 'success');
        fetchDetailCodes();
      } catch (error) {
        console.error('Failed to delete detail code:', error);
        showSnackbar('삭제에 실패했습니다.', 'error');
      }
    }
  };

  const detailColumns: GridColDef[] = [
    {
      field: 'code',
      headerName: '코드',
      flex: 1,
      minWidth: 100,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'codeNm',
      headerName: '코드명',
      flex: 1.5,
      minWidth: 150,
      headerAlign: 'center',
    },
    {
      field: 'codeDc',
      headerName: '설명',
      flex: 2,
      minWidth: 200,
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
      flex: 0.8,
      minWidth: 120,
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
              onClick={() => handleOpenEditDetailDialog(params.row)}
              disabled={!canWrite}
            >
              <EditIcon />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              onClick={() =>
                handleDeleteDetail(params.row.codeId, params.row.code)
              }
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
    <>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography variant="h6">
            {commonCode.codeIdNm} ({commonCode.codeId})
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateDetailDialog}
            disabled={!canWrite}
          >
            상세코드 등록
          </Button>
        </Stack>
      </Paper>

      <Paper>
        <DataGrid
          rows={detailCodes}
          columns={detailColumns}
          getRowId={(row) => `${row.codeId}-${row.code}`}
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

      {/* 상세코드 등록/수정 다이얼로그 */}
      <Dialog
        open={openDetailDialog}
        onClose={handleCloseDetailDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {detailDialogMode === 'create' ? '상세코드 등록' : '상세코드 수정'}
        </DialogTitle>
        <DialogContent dividers={true}>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <Controller
              name="code"
              control={detailCodeControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="코드"
                  fullWidth
                  required
                  disabled={detailDialogMode === 'edit'}
                  error={!!detailCodeErrors.code}
                  helperText={detailCodeErrors.code?.message}
                />
              )}
            />
            <Controller
              name="codeNm"
              control={detailCodeControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="코드명"
                  fullWidth
                  required
                  error={!!detailCodeErrors.codeNm}
                  helperText={detailCodeErrors.codeNm?.message}
                />
              )}
            />
            <Controller
              name="codeDc"
              control={detailCodeControl}
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
              name="useAt"
              control={detailCodeControl}
              render={({ field }) => (
                <FormControl fullWidth error={!!detailCodeErrors.useAt}>
                  <InputLabel>사용여부</InputLabel>
                  <Select {...field} label="사용여부">
                    <MenuItem value="Y">사용</MenuItem>
                    <MenuItem value="N">미사용</MenuItem>
                  </Select>
                  {detailCodeErrors.useAt && (
                    <Typography
                      variant="caption"
                      color="error"
                      sx={{ mt: 0.5 }}
                    >
                      {detailCodeErrors.useAt.message}
                    </Typography>
                  )}
                </FormControl>
              )}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleDetailCodeSubmit(handleSaveDetail)}
            variant="contained"
            color="primary"
          >
            저장
          </Button>
          <Button onClick={handleCloseDetailDialog}>취소</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DetailCodeTab;
