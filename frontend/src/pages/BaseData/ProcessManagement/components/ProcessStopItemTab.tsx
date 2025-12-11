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
import { Process, ProcessStopItem } from '../../../../types/process';
import { CommonDetailCode } from '../../../../types/commonCode';
import processService from '../../../../services/processService';
import commonCodeService from '../../../../services/commonCodeService';
import { usePermissions } from '../../../../contexts/PermissionContext';

// 중지항목 추가 유효성 검사 스키마
const stopItemSchema: yup.ObjectSchema<ProcessStopItem> = yup.object({
  processId: yup.string().required('공정 ID는 필수입니다.'),
  processCode: yup.string().required('공정 코드는 필수입니다.'),
  processStopItemId: yup.string(),
  stopItemCode: yup.string().required('중지 코드는 필수입니다.'),
  stopItemName: yup.string().required('중지항목명은 필수입니다.'),
  stopType: yup.string(),
  description: yup.string(),
  useYn: yup.string().required('사용 여부는 필수입니다.'),
});

interface ProcessStopItemTabProps {
  process: Process;
  showSnackbar: (m: string, s: 'success' | 'error') => void;
}

const ProcessStopItemTab: React.FC<ProcessStopItemTabProps> = ({
  process,
  showSnackbar,
}) => {
  // 권한 체크
  const { hasWritePermission, hasDeletePermission } = usePermissions();
  const canWrite = hasWritePermission('/base/process');
  const canDelete = hasDeletePermission('/base/process');

  const [stopItems, setStopItems] = useState<ProcessStopItem[]>([]);
  const [stopItemCodes, setStopItemCodes] = useState<CommonDetailCode[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');

  // react-hook-form 설정
  const {
    control: stopItemControl,
    handleSubmit: handleStopItemSubmit,
    reset: resetStopItemForm,
    setValue: setStopItemValue,
    formState: { errors: stopItemErrors },
  } = useForm<ProcessStopItem>({
    resolver: yupResolver(stopItemSchema),
    defaultValues: {
      processId: process.processId!,
      processCode: process.processCode!,
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

  const fetchStopItemCodes = useCallback(async () => {
    try {
      const response = await commonCodeService.getCommonDetailCodeList(
        'COM005',
        'Y'
      );
      if (response.resultCode === 200 && response.result?.detailCodeList) {
        setStopItemCodes(response.result.detailCodeList);
      }
    } catch (error) {
      console.error('Failed to fetch stop item codes:', error);
    }
  }, []);

  useEffect(() => {
    fetchStopItems();
    fetchStopItemCodes();
  }, [fetchStopItems, fetchStopItemCodes]);

  const handleStopItemCodeChange = (code: string) => {
    const selectedCode = stopItemCodes.find((sc) => sc.code === code);
    if (selectedCode) {
      setStopItemValue('stopItemCode', selectedCode.code);
      setStopItemValue('stopItemName', selectedCode.codeNm);
      setStopItemValue('description', selectedCode.codeDc || '');
    } else {
      setStopItemValue('stopItemCode', code);
    }
  };

  const handleSave = async (data: ProcessStopItem) => {
    if (!canWrite) {
      showSnackbar('저장 권한이 없습니다.', 'error');
      return;
    }
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
    if (!canDelete) {
      showSnackbar('삭제 권한이 없습니다.', 'error');
      return;
    }
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
      headerName: '중지 코드',
      flex: 1,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'stopItemName',
      headerName: '중지항목명',
      flex: 1,
      headerAlign: 'center',
    },
    {
      field: 'stopType',
      headerName: '중지 타입',
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
                resetStopItemForm(params.row);
                setOpenDialog(true);
              }}
              disabled={!canWrite}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDelete(params.row.processStopItemId!)}
              disabled={!canDelete}
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
            <Typography variant="subtitle1">중지항목 관리</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setDialogMode('create');
                resetStopItemForm({
                  processId: process.processId!,
                  processCode: process.processCode!,
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
              중지항목 추가
            </Button>
          </Stack>
        </CardContent>
      </Card>
      <Paper sx={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={stopItems}
          columns={stopItemColumns}
          getRowId={(row) => row.processStopItemId || ''}
          hideFooterPagination
          disableRowSelectionOnClick
          localeText={{ noRowsLabel: '등록된 중지항목이 없습니다' }}
        />
      </Paper>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {dialogMode === 'create' ? '중지항목 등록' : '중지항목 수정'}
        </DialogTitle>
        <DialogContent dividers={true}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Controller
              name="stopItemCode"
              control={stopItemControl}
              render={({ field }) => (
                <FormControl
                  fullWidth
                  required
                  error={!!stopItemErrors.stopItemCode}
                >
                  <InputLabel>중지코드</InputLabel>
                  <Select
                    {...field}
                    label="중지코드"
                    onChange={(e) => {
                      field.onChange(e);
                      handleStopItemCodeChange(e.target.value);
                    }}
                    disabled={dialogMode === 'edit'}
                  >
                    {stopItemCodes.map((code) => (
                      <MenuItem key={code.code} value={code.code}>
                        {code.codeNm} ({code.code})
                      </MenuItem>
                    ))}
                  </Select>
                  {stopItemErrors.stopItemCode && (
                    <Typography
                      variant="caption"
                      color="error"
                      sx={{ mt: 0.5 }}
                    >
                      {stopItemErrors.stopItemCode.message}
                    </Typography>
                  )}
                </FormControl>
              )}
            />
            <Controller
              name="stopItemName"
              control={stopItemControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  required
                  label="중지항목명"
                  disabled
                  error={!!stopItemErrors.stopItemName}
                  helperText={stopItemErrors.stopItemName?.message}
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

export default ProcessStopItemTab;
