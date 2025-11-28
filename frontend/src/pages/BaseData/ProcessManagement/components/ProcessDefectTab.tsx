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
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
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
import { Process, ProcessDefect } from '../../../../types/process';
import { CommonDetailCode } from '../../../../types/commonCode';
import processService from '../../../../services/processService';
import commonCodeService from '../../../../services/commonCodeService';
import { usePermissions } from '../../../../contexts/PermissionContext';

// 불량코드 추가 유효성 검사 스키마
const defectSchema: yup.ObjectSchema<ProcessDefect> = yup.object({
  processId: yup.string().required('공정 ID는 필수입니다.'),
  processCode: yup.string().required('공정 코드는 필수입니다.'),
  processDefectId: yup.string(),
  defectCode: yup.string().required('불량 코드는 필수입니다.'),
  defectName: yup.string().required('불량명은 필수입니다.'),
  defectType: yup.string(),
  description: yup.string(),
  useYn: yup.string().required('사용 여부는 필수입니다.'),
});

interface ProcessDefectTabProps {
  process: Process;
  showSnackbar: (m: string, s: 'success' | 'error') => void;
}

const ProcessDefectTab: React.FC<ProcessDefectTabProps> = ({
  process,
  showSnackbar,
}) => {
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
      processCode: process.processCode!,
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
      headerAlign: 'center',
    },
    {
      field: 'defectType',
      headerName: '현장표기명',
      flex: 1,
      headerAlign: 'center',
    },
    {
      field: 'description',
      headerName: '설명',
      flex: 1.5,
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
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDelete(params.row.processDefectId!)}
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
    <Box>
      <Card sx={{ mb: 2, bgcolor: '#f5f5f5' }}>
        <CardContent>
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="subtitle1">불량코드 관리</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setDialogMode('create');
                resetDefectForm({
                  processId: process.processId!,
                  processCode: process.processCode!,
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
        <DialogContent dividers={true}>
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
                <TextField {...field} fullWidth label="현장표기명" />
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

export default ProcessDefectTab;
