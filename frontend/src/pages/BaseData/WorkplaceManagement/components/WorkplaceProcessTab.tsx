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
  Typography,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { Workplace } from '../../../../types/workplace';
import { WorkplaceProcess } from '../../../../types/process';
import workplaceService from '../../../../services/workplaceService';
import processService from '../../../../services/processService';
import { usePermissions } from '../../../../contexts/PermissionContext';

interface WorkplaceProcessTabProps {
  workplace: Workplace;
  showSnackbar: (message: string, severity: 'success' | 'error') => void;
}

const WorkplaceProcessTab: React.FC<WorkplaceProcessTabProps> = ({
  workplace,
  showSnackbar,
}) => {
  // 권한 체크
  const { hasWritePermission } = usePermissions();
  const canWrite = hasWritePermission('/base/workplace');

  const [processes, setProcesses] = useState<WorkplaceProcess[]>([]);
  const [availableProcesses, setAvailableProcesses] = useState<any[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState<WorkplaceProcess>({
    workplaceId: workplace.workplaceId!,
    workplaceCode: workplace.workplaceCode!,
    workplaceName: workplace.workplaceName,
    processId: '',
    processCode: '',
    processName: '',
    useYn: 'Y',
  });

  const fetchProcesses = useCallback(async () => {
    try {
      const response = await workplaceService.getWorkplaceProcesses(
        workplace.workplaceCode!
      );
      if (response.resultCode === 200 && response.result?.resultList) {
        setProcesses(response.result.resultList);
      }
    } catch (error) {
      console.error('Failed to fetch processes:', error);
    }
  }, [workplace.workplaceCode]);

  const fetchAvailableProcesses = useCallback(async () => {
    try {
      const response = await processService.getProcessList(0, 1000, {
        status: 'ACTIVE',
        useYn: 'Y',
      });
      if (response.resultCode === 200 && response.result?.resultList) {
        setAvailableProcesses(response.result.resultList);
      }
    } catch (error) {
      console.error('Failed to fetch available processes:', error);
    }
  }, []);

  useEffect(() => {
    fetchProcesses();
    fetchAvailableProcesses();
  }, [fetchProcesses, fetchAvailableProcesses]);

  const handleProcessChange = (processId: string) => {
    const selectedProcess = availableProcesses.find(
      (p) => p.processId === processId
    );
    if (selectedProcess) {
      setFormData({
        ...formData,
        processId: selectedProcess.processId,
        processCode: selectedProcess.processCode,
        processName: selectedProcess.processName,
      });
    } else {
      setFormData({ ...formData, processId });
    }
  };

  const handleSave = async () => {
    try {
      await workplaceService.addWorkplaceProcess(
        workplace.workplaceId!,
        formData
      );
      showSnackbar('공정이 등록되었습니다.', 'success');
      setOpenDialog(false);
      fetchProcesses();
    } catch (error) {
      console.error('Failed to save process:', error);
      showSnackbar('저장에 실패했습니다.', 'error');
    }
  };

  const handleDelete = async (workplaceProcessCode: string) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        await workplaceService.removeWorkplaceProcess(
          workplace.workplaceCode!,
          workplaceProcessCode
        );
        showSnackbar('공정이 삭제되었습니다.', 'success');
        fetchProcesses();
      } catch (error) {
        console.error('Failed to delete process:', error);
        showSnackbar('삭제에 실패했습니다.', 'error');
      }
    }
  };

  const processColumns: GridColDef[] = [
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
      field: 'regDt',
      headerName: '등록일',
      width: 200,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'actions',
      headerName: '관리',
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
          <IconButton
            size="small"
            color="error"
            onClick={() => handleDelete(params.row.processCode!)}
            disabled={!canWrite}
          >
            <DeleteIcon />
          </IconButton>
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
            <Typography variant="subtitle1">공정 관리</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setFormData({
                  workplaceId: workplace.workplaceId!,
                  workplaceCode: workplace.workplaceCode!,
                  processId: '',
                  workplaceName: workplace.workplaceName,
                  processCode: '',
                  processName: '',
                  useYn: 'Y',
                });
                setOpenDialog(true);
              }}
              disabled={!canWrite}
            >
              공정 추가
            </Button>
          </Stack>
        </CardContent>
      </Card>
      <Paper sx={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={processes}
          columns={processColumns}
          getRowId={(row) => row.workplaceProcessId || ''}
          hideFooterPagination
          disableRowSelectionOnClick
          localeText={{ noRowsLabel: '등록된 공정이 없습니다' }}
        />
      </Paper>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>공정 등록</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth required>
              <InputLabel>공정</InputLabel>
              <Select
                value={formData.processId}
                label="공정"
                onChange={(e) => handleProcessChange(e.target.value)}
              >
                {availableProcesses.map((process) => (
                  <MenuItem key={process.processId} value={process.processId}>
                    {process.processName} ({process.processCode})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSave} variant="contained">
            저장
          </Button>
          <Button onClick={() => setOpenDialog(false)}>취소</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WorkplaceProcessTab;
