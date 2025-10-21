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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  People as PeopleIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { Workplace, WorkplaceWorker } from '../../../types/workplace';
import workplaceService from '../../../services/workplaceService';

const WorkplaceManagement: React.FC = () => {
  const [workplaces, setWorkplaces] = useState<Workplace[]>([]);
  const [selectedWorkplace, setSelectedWorkplace] = useState<Workplace | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openWorkerDialog, setOpenWorkerDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // 폼 상태
  const [formData, setFormData] = useState<Workplace>({
    workplaceCode: '',
    workplaceName: '',
    description: '',
    location: '',
    workplaceType: '',
    status: 'ACTIVE',
    useYn: 'Y',
  });

  // 검색 상태
  const [searchParams, setSearchParams] = useState({
    searchCnd: '1',
    searchWrd: '',
    status: '',
  });

  // 작업장 목록 조회
  const fetchWorkplaces = useCallback(async () => {
    try {
      const response = await workplaceService.getWorkplaceList(searchParams);
      if (response.resultCode === '200' && response.result?.resultList) {
        setWorkplaces(response.result.resultList);
      }
    } catch (error) {
      console.error('Failed to fetch workplaces:', error);
      showSnackbar('작업장 목록을 불러오는데 실패했습니다.', 'error');
    }
  }, [searchParams]);

  useEffect(() => {
    fetchWorkplaces();
  }, [fetchWorkplaces]);

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleOpenCreateDialog = () => {
    setDialogMode('create');
    setFormData({
      workplaceCode: '',
      workplaceName: '',
      description: '',
      location: '',
      workplaceType: '',
      status: 'ACTIVE',
      useYn: 'Y',
    });
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (workplace: Workplace) => {
    setDialogMode('edit');
    setFormData(workplace);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleChange = (field: keyof Workplace, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSave = async () => {
    try {
      if (dialogMode === 'create') {
        await workplaceService.createWorkplace(formData);
        showSnackbar('작업장이 등록되었습니다.', 'success');
      } else {
        await workplaceService.updateWorkplace(formData.workplaceId!, formData);
        showSnackbar('작업장이 수정되었습니다.', 'success');
      }
      handleCloseDialog();
      fetchWorkplaces();
    } catch (error) {
      console.error('Failed to save workplace:', error);
      showSnackbar('저장에 실패했습니다.', 'error');
    }
  };

  const handleDelete = async (workplaceId: string) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        await workplaceService.deleteWorkplace(workplaceId);
        showSnackbar('작업장이 삭제되었습니다.', 'success');
        fetchWorkplaces();
      } catch (error) {
        console.error('Failed to delete workplace:', error);
        showSnackbar('삭제에 실패했습니다.', 'error');
      }
    }
  };

  const handleOpenWorkerDialog = (workplace: Workplace) => {
    setSelectedWorkplace(workplace);
    setOpenWorkerDialog(true);
  };

  const handleCloseWorkerDialog = () => {
    setOpenWorkerDialog(false);
    setSelectedWorkplace(null);
  };

  const handleSearch = () => {
    fetchWorkplaces();
  };

  const getStatusColor = (status: string) => {
    return status === 'ACTIVE' ? 'success' : 'default';
  };

  const getStatusLabel = (status: string) => {
    return status === 'ACTIVE' ? '활성' : '비활성';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        작업장 관리
      </Typography>

      {/* 검색 영역 */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ flex: '1 1 200px' }}>
              <FormControl fullWidth size="small">
                <InputLabel>검색 조건</InputLabel>
                <Select
                  value={searchParams.searchCnd}
                  label="검색 조건"
                  onChange={(e) => setSearchParams({ ...searchParams, searchCnd: e.target.value })}
                >
                  <MenuItem value="0">작업장 코드</MenuItem>
                  <MenuItem value="1">작업장명</MenuItem>
                  <MenuItem value="2">위치</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: '1 1 200px' }}>
              <TextField
                fullWidth
                size="small"
                label="검색어"
                value={searchParams.searchWrd}
                onChange={(e) => setSearchParams({ ...searchParams, searchWrd: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </Box>
            <Box sx={{ flex: '1 1 150px' }}>
              <FormControl fullWidth size="small">
                <InputLabel>상태</InputLabel>
                <Select
                  value={searchParams.status}
                  label="상태"
                  onChange={(e) => setSearchParams({ ...searchParams, status: e.target.value })}
                >
                  <MenuItem value="">전체</MenuItem>
                  <MenuItem value="ACTIVE">활성</MenuItem>
                  <MenuItem value="INACTIVE">비활성</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: '0 0 120px' }}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<SearchIcon />}
                onClick={handleSearch}
              >
                검색
              </Button>
            </Box>
            <Box sx={{ flex: '0 0 150px' }}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleOpenCreateDialog}
              >
                작업장 등록
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* 작업장 목록 */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>작업장 코드</TableCell>
                <TableCell>작업장명</TableCell>
                <TableCell>위치</TableCell>
                <TableCell>타입</TableCell>
                <TableCell>상태</TableCell>
                <TableCell>등록일</TableCell>
                <TableCell align="center">관리</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {workplaces.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    조회된 데이터가 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                workplaces.map((workplace) => (
                  <TableRow key={workplace.workplaceId} hover>
                    <TableCell>{workplace.workplaceCode}</TableCell>
                    <TableCell>{workplace.workplaceName}</TableCell>
                    <TableCell>{workplace.location}</TableCell>
                    <TableCell>{workplace.workplaceType}</TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(workplace.status || 'ACTIVE')}
                        color={getStatusColor(workplace.status || 'ACTIVE') as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{workplace.regDt}</TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenWorkerDialog(workplace)}
                          title="작업자 관리"
                        >
                          <PeopleIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenEditDialog(workplace)}
                          title="수정"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(workplace.workplaceId!)}
                          title="삭제"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* 작업장 등록/수정 다이얼로그 */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{dialogMode === 'create' ? '작업장 등록' : '작업장 수정'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                required
                label="작업장 코드"
                value={formData.workplaceCode}
                onChange={(e) => handleChange('workplaceCode', e.target.value)}
                disabled={dialogMode === 'edit'}
              />
              <TextField
                fullWidth
                required
                label="작업장명"
                value={formData.workplaceName}
                onChange={(e) => handleChange('workplaceName', e.target.value)}
              />
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                label="위치"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
              />
              <TextField
                fullWidth
                label="타입"
                value={formData.workplaceType}
                onChange={(e) => handleChange('workplaceType', e.target.value)}
              />
            </Stack>
            <Stack direction="row" spacing={2}>
              <FormControl fullWidth>
                <InputLabel>상태</InputLabel>
                <Select
                  value={formData.status}
                  label="상태"
                  onChange={(e) => handleChange('status', e.target.value)}
                >
                  <MenuItem value="ACTIVE">활성</MenuItem>
                  <MenuItem value="INACTIVE">비활성</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>사용 여부</InputLabel>
                <Select
                  value={formData.useYn}
                  label="사용 여부"
                  onChange={(e) => handleChange('useYn', e.target.value)}
                >
                  <MenuItem value="Y">사용</MenuItem>
                  <MenuItem value="N">미사용</MenuItem>
                </Select>
              </FormControl>
            </Stack>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="설명"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>취소</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            저장
          </Button>
        </DialogActions>
      </Dialog>

      {/* 작업자 관리 다이얼로그 */}
      {selectedWorkplace && (
        <WorkplaceWorkerDialog
          open={openWorkerDialog}
          workplace={selectedWorkplace}
          onClose={handleCloseWorkerDialog}
        />
      )}

      {/* 스낵바 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

// 작업자 관리 다이얼로그 컴포넌트
interface WorkplaceWorkerDialogProps {
  open: boolean;
  workplace: Workplace;
  onClose: () => void;
}

const WorkplaceWorkerDialog: React.FC<WorkplaceWorkerDialogProps> = ({ open, workplace, onClose }) => {
  const { useCallback } = React;
  const [workers, setWorkers] = useState<WorkplaceWorker[]>([]);
  const [newWorker, setNewWorker] = useState<WorkplaceWorker>({
    workplaceId: workplace.workplaceId!,
    workerId: '',
    workerName: '',
    position: '',
    role: 'MEMBER',
  });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const fetchWorkers = useCallback(async () => {
    try {
      const response = await workplaceService.getWorkplaceWorkers(workplace.workplaceId!);
      if (response.resultCode === '200' && response.result?.resultList) {
        setWorkers(response.result.resultList);
      }
    } catch (error) {
      console.error('Failed to fetch workers:', error);
    }
  }, [workplace.workplaceId]);

  useEffect(() => {
    if (open) {
      fetchWorkers();
    }
  }, [open, fetchWorkers]);

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleAddWorker = async () => {
    if (!newWorker.workerId || !newWorker.workerName) {
      showSnackbar('작업자 ID와 이름을 입력해주세요.', 'error');
      return;
    }

    try {
      await workplaceService.addWorkplaceWorker(workplace.workplaceId!, newWorker);
      showSnackbar('작업자가 추가되었습니다.', 'success');
      setNewWorker({
        workplaceId: workplace.workplaceId!,
        workerId: '',
        workerName: '',
        position: '',
        role: 'MEMBER',
      });
      fetchWorkers();
    } catch (error) {
      console.error('Failed to add worker:', error);
      showSnackbar('작업자 추가에 실패했습니다.', 'error');
    }
  };

  const handleRemoveWorker = async (workplaceWorkerId: string) => {
    if (window.confirm('작업자를 제외하시겠습니까?')) {
      try {
        await workplaceService.removeWorkplaceWorker(workplace.workplaceId!, workplaceWorkerId);
        showSnackbar('작업자가 제외되었습니다.', 'success');
        fetchWorkers();
      } catch (error) {
        console.error('Failed to remove worker:', error);
        showSnackbar('작업자 제외에 실패했습니다.', 'error');
      }
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          작업자 관리 - {workplace.workplaceName}
        </DialogTitle>
        <DialogContent>
          {/* 작업자 추가 폼 */}
          <Card sx={{ mb: 2, bgcolor: '#f5f5f5' }}>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                작업자 추가
              </Typography>
              <Stack direction="row" spacing={2} sx={{ mt: 0.5, flexWrap: 'wrap' }}>
                <Box sx={{ flex: '1 1 150px' }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="작업자 ID"
                    value={newWorker.workerId}
                    onChange={(e) => setNewWorker({ ...newWorker, workerId: e.target.value })}
                  />
                </Box>
                <Box sx={{ flex: '1 1 150px' }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="작업자명"
                    value={newWorker.workerName}
                    onChange={(e) => setNewWorker({ ...newWorker, workerName: e.target.value })}
                  />
                </Box>
                <Box sx={{ flex: '1 1 120px' }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="직책"
                    value={newWorker.position}
                    onChange={(e) => setNewWorker({ ...newWorker, position: e.target.value })}
                  />
                </Box>
                <Box sx={{ flex: '1 1 120px' }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>역할</InputLabel>
                    <Select
                      value={newWorker.role}
                      label="역할"
                      onChange={(e) => setNewWorker({ ...newWorker, role: e.target.value })}
                    >
                      <MenuItem value="LEADER">팀장</MenuItem>
                      <MenuItem value="MEMBER">팀원</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ flex: '0 0 100px' }}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleAddWorker}
                    startIcon={<AddIcon />}
                  >
                    추가
                  </Button>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* 작업자 목록 */}
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>작업자 ID</TableCell>
                  <TableCell>작업자명</TableCell>
                  <TableCell>직책</TableCell>
                  <TableCell>역할</TableCell>
                  <TableCell>등록일</TableCell>
                  <TableCell align="center">관리</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {workers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      등록된 작업자가 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  workers.map((worker) => (
                    <TableRow key={worker.workplaceWorkerId}>
                      <TableCell>{worker.workerId}</TableCell>
                      <TableCell>{worker.workerName}</TableCell>
                      <TableCell>{worker.position}</TableCell>
                      <TableCell>
                        <Chip
                          label={worker.role === 'LEADER' ? '팀장' : '팀원'}
                          color={worker.role === 'LEADER' ? 'primary' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{worker.regDt}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleRemoveWorker(worker.workplaceWorkerId!)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>닫기</Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default WorkplaceManagement;
