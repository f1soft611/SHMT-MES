import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
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
import { Workplace, WorkplaceWorker } from '../../../../types/workplace';
import workplaceService from '../../../../services/workplaceService';
import UserSelectionDialog from '../../../../components/common/UserSelectionDialog';
import { User } from '../../../../services/admin/userService';
import { usePermissions } from '../../../../contexts/PermissionContext';

interface WorkplaceWorkerTabProps {
  workplace: Workplace;
  showSnackbar: (message: string, severity: 'success' | 'error') => void;
}

const WorkplaceWorkerTab: React.FC<WorkplaceWorkerTabProps> = ({
  workplace,
  showSnackbar,
}) => {
  // 권한 체크
  const { hasWritePermission, refreshPermissions } = usePermissions();
  const workplaceMenuUrls = ['/base/workplace', '/base-data/workplace'];
  const canWrite = workplaceMenuUrls.some((url) => hasWritePermission(url));

  useEffect(() => {
    const refresh = async () => {
      await refreshPermissions();
    };
    refresh();
  }, [refreshPermissions]);

  const [workers, setWorkers] = useState<WorkplaceWorker[]>([]);
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingWorker, setEditingWorker] = useState<WorkplaceWorker | null>(
    null
  );

  const fetchWorkers = useCallback(async () => {
    try {
      const response = await workplaceService.getWorkplaceWorkers(
        workplace.workplaceCode!
      );
      if (response.resultCode === 200 && response.result?.resultList) {
        setWorkers(response.result.resultList);
      }
    } catch (error) {
      console.error('Failed to fetch workers:', error);
    }
  }, [workplace.workplaceCode]);

  useEffect(() => {
    fetchWorkers();
  }, [fetchWorkers]);

  const handleUserSelect = async (user: User) => {
    const newWorker: WorkplaceWorker = {
      workplaceId: workplace.workplaceId!,
      workplaceCode: workplace.workplaceCode!,
      workerId: user.mberId,
      workerCode: user.mberId,
      workerName: user.mberNm,
      position: '',
      role: 'MEMBER',
    };

    try {
      await workplaceService.addWorkplaceWorker(
        workplace.workplaceId!,
        newWorker
      );
      showSnackbar('작업자가 추가되었습니다.', 'success');
      fetchWorkers();
    } catch (error) {
      console.error('Failed to add worker:', error);
      showSnackbar('작업자 추가에 실패했습니다.', 'error');
    }
  };

  const handleEditWorker = (worker: WorkplaceWorker) => {
    setEditingWorker({ ...worker });
    setOpenEditDialog(true);
  };

  const handleUpdateWorker = async () => {
    if (!editingWorker) return;

    try {
      await workplaceService.updateWorkplaceWorker(
        workplace.workplaceCode!,
        editingWorker.workerCode!,
        editingWorker
      );
      showSnackbar('작업자 정보가 수정되었습니다.', 'success');
      setOpenEditDialog(false);
      setEditingWorker(null);
      fetchWorkers();
    } catch (error) {
      console.error('Failed to update worker:', error);
      showSnackbar('작업자 수정에 실패했습니다.', 'error');
    }
  };

  const handleRemoveWorker = async (workplaceWorkerCode: string) => {
    if (window.confirm('작업자를 제외하시겠습니까?')) {
      try {
        await workplaceService.removeWorkplaceWorker(
          workplace.workplaceCode!,
          workplaceWorkerCode
        );
        showSnackbar('작업자가 제외되었습니다.', 'success');
        fetchWorkers();
      } catch (error) {
        console.error('Failed to remove worker:', error);
        showSnackbar('작업자 제외에 실패했습니다.', 'error');
      }
    }
  };

  const workerColumns: GridColDef[] = [
    {
      field: 'workerId',
      headerName: '작업자 ID',
      flex: 1,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'workerName',
      headerName: '작업자명',
      flex: 1,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'role',
      headerName: '역할',
      flex: 1,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value === 'LEADER' ? '팀장' : '팀원'}
          color={params.value === 'LEADER' ? 'primary' : 'default'}
          size="small"
        />
      ),
    },
    {
      field: 'position',
      headerName: '근무구분',
      flex: 1,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        if (params.value === 'D') {
          return 'D(주간)';
        } else if (params.value === 'N') {
          return 'N(야간)';
        } else if (params.value === 'A') {
          return 'A(1교대)';
        } else if (params.value === 'B') {
          return 'B(2교대)';
        } else if (params.value === 'C') {
          return 'C(3교대)';
        } else {
          return '';
        }
      },
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
          <Stack direction="row" spacing={1}>
            <IconButton
              size="small"
              color="primary"
              onClick={() => handleEditWorker(params.row)}
              title="수정"
              disabled={!canWrite}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              onClick={() => handleRemoveWorker(params.row.workerCode!)}
              title="삭제"
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
            <Typography variant="subtitle1">작업자 관리</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenUserDialog(true)}
              disabled={!canWrite}
            >
              작업자 추가
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Paper sx={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={workers}
          columns={workerColumns}
          getRowId={(row) => row.workerCode || ''}
          hideFooterPagination
          disableRowSelectionOnClick
          sx={{
            // border: 'none',
            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: 'action.hover',
            },
          }}
          localeText={{
            noRowsLabel: '등록된 작업자가 없습니다',
            footerRowSelected: (count) => `${count}개 선택됨`,
          }}
        />
      </Paper>

      {/* 사용자 선택 다이얼로그 */}
      <UserSelectionDialog
        open={openUserDialog}
        onClose={() => setOpenUserDialog(false)}
        onSelect={handleUserSelect}
        title="작업자 선택"
      />

      {/* 작업자 수정 다이얼로그 */}
      <Dialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>작업자 수정</DialogTitle>
        <DialogContent dividers={true}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="작업자 ID"
              value={editingWorker?.workerId || ''}
              disabled
            />
            <TextField
              fullWidth
              label="작업자명"
              value={editingWorker?.workerName || ''}
              disabled
            />
            <FormControl fullWidth>
              <InputLabel>역할</InputLabel>
              <Select
                value={editingWorker?.role || 'MEMBER'}
                label="역할"
                onChange={(e) =>
                  setEditingWorker({
                    ...editingWorker!,
                    role: e.target.value,
                  })
                }
              >
                <MenuItem value="LEADER">팀장</MenuItem>
                <MenuItem value="MEMBER">팀원</MenuItem>
              </Select>
            </FormControl>
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                label="작업장타입"
                value={workplace?.workplaceType || ''}
                disabled
              />
              <FormControl fullWidth>
                <InputLabel>근무구분</InputLabel>
                <Select
                  value={editingWorker?.position || ''}
                  label="근무구분"
                  onChange={(e) =>
                    setEditingWorker({
                      ...editingWorker!,
                      position: e.target.value,
                    })
                  }
                >
                  {workplace?.workplaceType === 'A'
                    ? [
                        <MenuItem key="D" value="D">
                          주간
                        </MenuItem>,
                        <MenuItem key="N" value="N">
                          야간
                        </MenuItem>,
                      ]
                    : [
                        <MenuItem key="A" value="A">
                          A(1교대)
                        </MenuItem>,
                        <MenuItem key="B" value="B">
                          B(2교대)
                        </MenuItem>,
                        <MenuItem key="C" value="C">
                          C(3교대)
                        </MenuItem>,
                      ]}
                </Select>
              </FormControl>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleUpdateWorker} variant="contained">
            저장
          </Button>
          <Button onClick={() => setOpenEditDialog(false)}>취소</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WorkplaceWorkerTab;
