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
import { Process, ProcessEquipment } from '../../../../types/process';
import { Equipment } from '../../../../types/equipment';
import processService from '../../../../services/processService';
import equipmentService from '../../../../services/equipmentService';
import { usePermissions } from '../../../../contexts/PermissionContext';

// 설비 추가 유효성 검사 스키마
const equipmentSchema: yup.ObjectSchema<ProcessEquipment> = yup.object({
  processId: yup.string().required('공정 ID는 필수입니다.'),
  processCode: yup.string().required('공정 코드는 필수입니다.'),
  processEquipmentId: yup.string(),
  equipSysCd: yup.string().required('설비 시스템 코드는 필수입니다.'),
  equipCd: yup.string(),
  equipmentName: yup.string(),
  equipSpec: yup.string(),
  equipStruct: yup.string(),
  description: yup.string(),
  useYn: yup.string().required('사용 여부는 필수입니다.'),
});

interface ProcessEquipmentTabProps {
  process: Process;
  showSnackbar: (m: string, s: 'success' | 'error') => void;
}

const ProcessEquipmentTab: React.FC<ProcessEquipmentTabProps> = ({
  process,
  showSnackbar,
}) => {
  // 권한 체크
  const { hasWritePermission } = usePermissions();
  const canWrite = hasWritePermission('/base/process');

  const [equipments, setEquipments] = useState<ProcessEquipment[]>([]);
  const [availableEquipments, setAvailableEquipments] = useState<Equipment[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');

  // react-hook-form 설정
  const {
    control: equipmentControl,
    handleSubmit: handleEquipmentSubmit,
    reset: resetEquipmentForm,
    setValue: setEquipmentValue,
    watch,
    formState: { errors: equipmentErrors },
  } = useForm<ProcessEquipment>({
    resolver: yupResolver(equipmentSchema),
    defaultValues: {
      processId: process.processId!,
      processCode: process.processCode!,
      processEquipmentId: '',
      equipSysCd: '',
      equipCd: '',
      equipmentName: '',
      equipSpec: '',
      equipStruct: '',
      description: '',
      useYn: 'Y',
    },
  });

  const selectedEquipSysCd = watch('equipSysCd');

  const fetchEquipments = useCallback(async () => {
    try {
      const response = await processService.getProcessEquipments(
        process.processId!
      );
      if (response.resultCode === 200 && response.result?.resultList) {
        setEquipments(response.result.resultList);
      }
    } catch (error) {
      console.error('Failed to fetch equipments:', error);
    }
  }, [process.processId]);

  const fetchAvailableEquipments = useCallback(async () => {
    try {
      const response = await equipmentService.getEquipmentList(0, 1000);
      if (response.resultCode === 200 && response.result?.resultList) {
        setAvailableEquipments(response.result.resultList);
      }
    } catch (error) {
      console.error('Failed to fetch available equipments:', error);
    }
  }, []);

  useEffect(() => {
    fetchEquipments();
    fetchAvailableEquipments();
  }, [fetchEquipments, fetchAvailableEquipments]);

  useEffect(() => {
    if (selectedEquipSysCd && dialogMode === 'create') {
      const selectedEquipment = availableEquipments.find(
        (eq) => eq.equipSysCd === selectedEquipSysCd
      );
      if (selectedEquipment) {
        setEquipmentValue('equipCd', selectedEquipment.equipCd || '');
        setEquipmentValue('equipmentName', selectedEquipment.equipmentName || '');
        setEquipmentValue('equipSpec', selectedEquipment.equipSpec || '');
        setEquipmentValue('equipStruct', selectedEquipment.equipStruct || '');
      }
    }
  }, [selectedEquipSysCd, availableEquipments, dialogMode, setEquipmentValue]);

  const handleSave = async (data: ProcessEquipment) => {
    try {
      if (dialogMode === 'create') {
        const result = await processService.addProcessEquipment(process.processId!, data);
        if (result.resultCode === 200) {
          showSnackbar('설비가 등록되었습니다.', 'success');
        } else {
          showSnackbar(result.result?.message || '등록에 실패했습니다.', 'error');
          return;
        }
      } else {
        await processService.updateProcessEquipment(
          process.processId!,
          data.processEquipmentId!,
          data
        );
        showSnackbar('설비가 수정되었습니다.', 'success');
      }
      setOpenDialog(false);
      resetEquipmentForm();
      fetchEquipments();
    } catch (error: any) {
      console.error('Failed to save equipment:', error);
      showSnackbar(error?.response?.data?.result?.message || '저장에 실패했습니다.', 'error');
    }
  };

  const handleDelete = async (processEquipmentId: string) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        await processService.removeProcessEquipment(
          process.processId!,
          processEquipmentId
        );
        showSnackbar('설비가 삭제되었습니다.', 'success');
        fetchEquipments();
      } catch (error) {
        console.error('Failed to delete equipment:', error);
        showSnackbar('삭제에 실패했습니다.', 'error');
      }
    }
  };

  const equipmentColumns: GridColDef[] = [
    {
      field: 'equipSysCd',
      headerName: '설비 시스템 코드',
      flex: 1,
      align: 'center',
      headerAlign: 'center',
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
      field: 'equipStruct',
      headerName: '설비 구조',
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
                resetEquipmentForm(params.row);
                setOpenDialog(true);
              }}
              disabled={!canWrite}
            >
              <EditIcon />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDelete(params.row.processEquipmentId!)}
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
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="subtitle1">설비 관리</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setDialogMode('create');
                resetEquipmentForm({
                  processId: process.processId!,
                  processCode: process.processCode!,
                  equipSysCd: '',
                  equipCd: '',
                  equipmentName: '',
                  equipSpec: '',
                  equipStruct: '',
                  description: '',
                  useYn: 'Y',
                });
                setOpenDialog(true);
              }}
              disabled={!canWrite}
            >
              설비 추가
            </Button>
          </Stack>
        </CardContent>
      </Card>
      <Paper sx={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={equipments}
          columns={equipmentColumns}
          getRowId={(row) => row.processEquipmentId || ''}
          hideFooterPagination
          disableRowSelectionOnClick
          localeText={{ noRowsLabel: '등록된 설비가 없습니다' }}
        />
      </Paper>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {dialogMode === 'create' ? '설비 등록' : '설비 수정'}
        </DialogTitle>
        <DialogContent dividers={true}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Controller
              name="equipSysCd"
              control={equipmentControl}
              render={({ field }) => (
                <FormControl
                  fullWidth
                  required
                  error={!!equipmentErrors.equipSysCd}
                >
                  <InputLabel>설비</InputLabel>
                  <Select
                    {...field}
                    label="설비"
                    disabled={dialogMode === 'edit'}
                  >
                    {availableEquipments.map((equipment) => (
                      <MenuItem key={equipment.equipSysCd} value={equipment.equipSysCd}>
                        {equipment.equipmentName} ({equipment.equipSysCd})
                      </MenuItem>
                    ))}
                  </Select>
                  {equipmentErrors.equipSysCd && (
                    <Typography
                      variant="caption"
                      color="error"
                      sx={{ mt: 0.5 }}
                    >
                      {equipmentErrors.equipSysCd.message}
                    </Typography>
                  )}
                </FormControl>
              )}
            />
            <Controller
              name="equipmentName"
              control={equipmentControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="설비명"
                  disabled
                />
              )}
            />
            <Stack direction="row" spacing={2}>
              <Controller
                name="equipSpec"
                control={equipmentControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="설비 규격"
                    disabled
                  />
                )}
              />
              <Controller
                name="equipStruct"
                control={equipmentControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="설비 구조"
                    disabled
                  />
                )}
              />
            </Stack>
            <Controller
              name="description"
              control={equipmentControl}
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
            onClick={handleEquipmentSubmit(handleSave)}
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

export default ProcessEquipmentTab;
