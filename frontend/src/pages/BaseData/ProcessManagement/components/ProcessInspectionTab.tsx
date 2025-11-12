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
import { Process, ProcessInspection } from '../../../../types/process';
import processService from '../../../../services/processService';
import { usePermissions } from '../../../../contexts/PermissionContext';

// 검사항목 추가 유효성 검사 스키마
const inspectionSchema: yup.ObjectSchema<ProcessInspection> = yup.object({
  processId: yup.string().required('공정 ID는 필수입니다.'),
  processCode: yup.string().required('공정 코드는 필수입니다.'),
  processInspectionId: yup.string(),
  inspectionCode: yup.string().required('검사 코드는 필수입니다.'),
  inspectionName: yup.string().required('검사명은 필수입니다.'),
  inspectionType: yup.string(),
  standardValue: yup.string(),
  upperLimit: yup.number().nullable(),
  lowerLimit: yup.number().nullable(),
  unit: yup.string(),
  description: yup.string(),
  useYn: yup.string().required('사용 여부는 필수입니다.'),
});

interface ProcessInspectionTabProps {
  process: Process;
  showSnackbar: (m: string, s: 'success' | 'error') => void;
}

const ProcessInspectionTab: React.FC<ProcessInspectionTabProps> = ({
  process,
  showSnackbar,
}) => {
  // 권한 체크
  const { hasWritePermission } = usePermissions();
  const canWrite = hasWritePermission('/base/process');

  const [inspections, setInspections] = useState<ProcessInspection[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');

  // react-hook-form 설정
  const {
    control: inspectionControl,
    handleSubmit: handleInspectionSubmit,
    reset: resetInspectionForm,
    formState: { errors: inspectionErrors },
  } = useForm<ProcessInspection>({
    resolver: yupResolver(inspectionSchema),
    defaultValues: {
      processId: process.processId!,
      processCode: process.processCode!,
      processInspectionId: '',
      inspectionCode: '',
      inspectionName: '',
      inspectionType: '',
      standardValue: '',
      upperLimit: null,
      lowerLimit: null,
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

  useEffect(() => {
    fetchInspections();
  }, [fetchInspections]);

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
      headerName: '검사명',
      flex: 1,
      headerAlign: 'center',
    },
    {
      field: 'inspectionType',
      headerName: '검사 타입',
      flex: 1,
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
      field: 'lowerLimit',
      headerName: '하한값',
      flex: 0.8,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'upperLimit',
      headerName: '상한값',
      flex: 0.8,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'unit',
      headerName: '단위',
      flex: 0.6,
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
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="subtitle1">검사항목 관리</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setDialogMode('create');
                resetInspectionForm({
                  processId: process.processId!,
                  processCode: process.processCode!,
                  inspectionCode: '',
                  inspectionName: '',
                  inspectionType: '',
                  standardValue: '',
                  upperLimit: null,
                  lowerLimit: null,
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
        maxWidth="sm"
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
                  <TextField
                    {...field}
                    fullWidth
                    required
                    label="검사 코드"
                    disabled={dialogMode === 'edit'}
                    error={!!inspectionErrors.inspectionCode}
                    helperText={inspectionErrors.inspectionCode?.message}
                  />
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
                    label="검사명"
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
                name="unit"
                control={inspectionControl}
                render={({ field }) => (
                  <TextField {...field} fullWidth label="단위" />
                )}
              />
            </Stack>
            <Controller
              name="standardValue"
              control={inspectionControl}
              render={({ field }) => (
                <TextField {...field} fullWidth label="기준값" />
              )}
            />
            <Stack direction="row" spacing={2}>
              <Controller
                name="lowerLimit"
                control={inspectionControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="하한값"
                    type="number"
                    value={field.value ?? ''}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? parseFloat(e.target.value) : null
                      )
                    }
                  />
                )}
              />
              <Controller
                name="upperLimit"
                control={inspectionControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="상한값"
                    type="number"
                    value={field.value ?? ''}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? parseFloat(e.target.value) : null
                      )
                    }
                  />
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

export default ProcessInspectionTab;
