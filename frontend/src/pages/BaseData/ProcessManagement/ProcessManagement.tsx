import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle,
  IconButton, Paper, Stack, TextField, Typography, Chip, FormControl, InputLabel,
  Select, MenuItem, Alert, Snackbar, Tabs, Tab, Checkbox, FormControlLabel,
} from '@mui/material';
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon,
  BugReport as BugReportIcon, CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { Process, ProcessDefect, ProcessInspection } from '../../../types/process';
import { CommonDetailCode } from '../../../types/commonCode';
import processService from '../../../services/processService';
import commonCodeService from '../../../services/commonCodeService';

const ProcessManagement: React.FC = () => {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedProcess, setSelectedProcess] = useState<Process | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [detailTab, setDetailTab] = useState(0);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error'; }>({
    open: false, message: '', severity: 'success',
  });

  const [formData, setFormData] = useState<Process>({
    processCode: '', processName: '', description: '', processType: '',
    equipmentIntegrationYn: 'N', status: 'ACTIVE', useYn: 'Y', sortOrder: 0,
  });

  const [searchParams, setSearchParams] = useState({
    searchCnd: '1', searchWrd: '', status: '', equipmentIntegrationYn: '',
  });

  const [inputValues, setInputValues] = useState({
    searchCnd: '1', searchWrd: '', status: '', equipmentIntegrationYn: '',
  });

  const fetchProcesses = useCallback(async () => {
    try {
      const response = await processService.getProcessList(
        paginationModel.page,
        paginationModel.pageSize,
        searchParams
      );
      if (response.resultCode === 200 && response.result?.resultList) {
        setProcesses(response.result.resultList);
        setTotalCount(parseInt(response.result.resultCnt || '0'));
      }
    } catch (error) {
      console.error('Failed to fetch processes:', error);
      showSnackbar('공정 목록을 불러오는데 실패했습니다.', 'error');
    }
  }, [searchParams, paginationModel]);

  useEffect(() => {
    fetchProcesses();
  }, [fetchProcesses]);

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
    setFormData({
      processCode: '', processName: '', description: '', processType: '',
      equipmentIntegrationYn: 'N', status: 'ACTIVE', useYn: 'Y', sortOrder: 0,
    });
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (process: Process) => {
    setDialogMode('edit');
    setFormData(process);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleChange = (field: keyof Process, value: string | number) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSave = async () => {
    try {
      if (dialogMode === 'create') {
        const result = await processService.createProcess(formData);
        if (result.resultCode === 200) {
          showSnackbar('공정이 등록되었습니다.', 'success');
        } else {
          showSnackbar(result.result.message, 'error');
        }
      } else {
        await processService.updateProcess(formData.processId!, formData);
        showSnackbar('공정이 수정되었습니다.', 'success');
      }
      handleCloseDialog();
      fetchProcesses();
    } catch (error) {
      console.error('Failed to save process:', error);
      showSnackbar('저장에 실패했습니다.', 'error');
    }
  };

  const handleDelete = async (processId: string) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        await processService.deleteProcess(processId);
        showSnackbar('공정이 삭제되었습니다.', 'success');
        fetchProcesses();
      } catch (error) {
        console.error('Failed to delete process:', error);
        showSnackbar('삭제에 실패했습니다.', 'error');
      }
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

  const getStatusColor = (status: string) => status === 'ACTIVE' ? 'success' : 'default';
  const getStatusLabel = (status: string) => status === 'ACTIVE' ? '활성' : '비활성';

  const columns: GridColDef[] = [
    { field: 'processCode', headerName: '공정 코드', flex: 1, align: 'center', headerAlign: 'center' },
    { field: 'processName', headerName: '공정명', flex: 1.2, align: 'center', headerAlign: 'center' },
    { field: 'processType', headerName: '공정 타입', flex: 1, align: 'center', headerAlign: 'center' },
    {
      field: 'equipmentIntegrationYn', headerName: '설비연동', flex: 0.8, align: 'center', headerAlign: 'center',
      renderCell: (params) => <Chip label={params.value === 'Y' ? '연동' : '미연동'} 
        color={params.value === 'Y' ? 'primary' : 'default'} size="small" />
    },
    {
      field: 'status', headerName: '상태', flex: 0.8, align: 'center', headerAlign: 'center',
      renderCell: (params) => <Chip label={getStatusLabel(params.value || 'ACTIVE')}
        color={getStatusColor(params.value || 'ACTIVE') as any} size="small" />
    },
    { field: 'sortOrder', headerName: '순서', flex: 0.6, align: 'center', headerAlign: 'center' },
    { field: 'regDt', headerName: '등록일', flex: 1.2, align: 'center', headerAlign: 'center' },
    {
      field: 'actions', headerName: '관리', flex: 1.5, align: 'center', headerAlign: 'center', sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <Stack direction="row" spacing={1} justifyContent="center">
            <IconButton size="small" color="primary" onClick={() => handleOpenDetailDialog(params.row)} title="상세관리">
              <BuildIcon />
            </IconButton>
            <IconButton size="small" color="primary" onClick={() => handleOpenEditDialog(params.row)} title="수정">
              <EditIcon />
            </IconButton>
            <IconButton size="small" color="error" onClick={() => handleDelete(params.row.processId!)} title="삭제">
              <DeleteIcon />
            </IconButton>
          </Stack>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h5">공정 관리</Typography>
        </Box>
        <Box>
          <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpenCreateDialog}>
            공정 등록
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ flex: '1 1 150px' }}>
            <FormControl fullWidth size="small">
              <InputLabel>검색 조건</InputLabel>
              <Select value={inputValues.searchCnd} label="검색 조건"
                onChange={(e) => handleInputChange('searchCnd', e.target.value)}>
                <MenuItem value="0">공정 코드</MenuItem>
                <MenuItem value="1">공정명</MenuItem>
                <MenuItem value="2">공정 타입</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ flex: '1 1 150px' }}>
            <FormControl fullWidth size="small">
              <InputLabel>상태</InputLabel>
              <Select value={inputValues.status} label="상태"
                onChange={(e) => handleInputChange('status', e.target.value)}>
                <MenuItem value="">전체</MenuItem>
                <MenuItem value="ACTIVE">활성</MenuItem>
                <MenuItem value="INACTIVE">비활성</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ flex: '1 1 150px' }}>
            <FormControl fullWidth size="small">
              <InputLabel>설비연동</InputLabel>
              <Select value={inputValues.equipmentIntegrationYn} label="설비연동"
                onChange={(e) => handleInputChange('equipmentIntegrationYn', e.target.value)}>
                <MenuItem value="">전체</MenuItem>
                <MenuItem value="Y">연동</MenuItem>
                <MenuItem value="N">미연동</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ flex: '1 1 200px' }}>
            <TextField fullWidth size="small" label="검색어" value={inputValues.searchWrd}
              onChange={(e) => handleInputChange('searchWrd', e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="검색어를 입력하세요" />
          </Box>
          <Box sx={{ flex: '1 1 150px' }}>
            <Button variant="contained" startIcon={<SearchIcon />} onClick={handleSearch}>검색</Button>
          </Box>
        </Stack>
      </Paper>

      <Paper sx={{ width: '100%' }}>
        <DataGrid rows={processes} columns={columns} getRowId={(row) => row.processId || ''}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[5, 10, 25, 50]}
          rowCount={totalCount}
          paginationMode="server"
          disableRowSelectionOnClick
          autoHeight
          sx={{ border: 'none', '& .MuiDataGrid-cell:focus': { outline: 'none' },
            '& .MuiDataGrid-row:hover': { backgroundColor: 'action.hover' } }}
          localeText={{ noRowsLabel: '조회된 데이터가 없습니다', footerRowSelected: (count) => `${count}개 선택됨` }} />
      </Paper>

      {/* 공정 등록/수정 다이얼로그 */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{dialogMode === 'create' ? '공정 등록' : '공정 수정'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Stack direction="row" spacing={2}>
              <TextField fullWidth required label="공정 코드" value={formData.processCode}
                onChange={(e) => handleChange('processCode', e.target.value)}
                disabled={dialogMode === 'edit'} />
              <TextField fullWidth required label="공정명" value={formData.processName}
                onChange={(e) => handleChange('processName', e.target.value)} />
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField fullWidth label="공정 타입" value={formData.processType}
                onChange={(e) => handleChange('processType', e.target.value)} />
              <TextField fullWidth label="정렬 순서" type="number" value={formData.sortOrder}
                onChange={(e) => handleChange('sortOrder', parseInt(e.target.value) || 0)} />
            </Stack>
            <Stack direction="row" spacing={2}>
              <FormControl fullWidth>
                <InputLabel>상태</InputLabel>
                <Select value={formData.status} label="상태"
                  onChange={(e) => handleChange('status', e.target.value)}>
                  <MenuItem value="ACTIVE">활성</MenuItem>
                  <MenuItem value="INACTIVE">비활성</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>사용 여부</InputLabel>
                <Select value={formData.useYn} label="사용 여부"
                  onChange={(e) => handleChange('useYn', e.target.value)}>
                  <MenuItem value="Y">사용</MenuItem>
                  <MenuItem value="N">미사용</MenuItem>
                </Select>
              </FormControl>
            </Stack>
            <FormControlLabel
              control={<Checkbox checked={formData.equipmentIntegrationYn === 'Y'}
                onChange={(e) => handleChange('equipmentIntegrationYn', e.target.checked ? 'Y' : 'N')} />}
              label="설비연동공정" />
            <TextField fullWidth multiline rows={3} label="설명" value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSave} variant="contained" color="primary">저장</Button>
          <Button onClick={handleCloseDialog}>취소</Button>
        </DialogActions>
      </Dialog>

      {/* 공정 상세관리 다이얼로그 */}
      {selectedProcess && (
        <ProcessDetailDialog open={openDetailDialog} process={selectedProcess} 
          onClose={handleCloseDetailDialog} detailTab={detailTab} 
          setDetailTab={setDetailTab} showSnackbar={showSnackbar} />
      )}

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

// 공정 상세관리 다이얼로그 컴포넌트
interface ProcessDetailDialogProps {
  open: boolean;
  process: Process;
  onClose: () => void;
  detailTab: number;
  setDetailTab: (tab: number) => void;
  showSnackbar: (message: string, severity: 'success' | 'error') => void;
}

const ProcessDetailDialog: React.FC<ProcessDetailDialogProps> = ({
  open, process, onClose, detailTab, setDetailTab, showSnackbar
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>공정 상세 관리 - {process.processName}</DialogTitle>
      <DialogContent>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={detailTab} onChange={(e, newValue) => setDetailTab(newValue)}>
            <Tab label="불량코드 관리" icon={<BugReportIcon />} iconPosition="start" />
            <Tab label="검사항목 관리" icon={<CheckCircleIcon />} iconPosition="start" />
          </Tabs>
        </Box>
        {detailTab === 0 && <ProcessDefectTab process={process} showSnackbar={showSnackbar} />}
        {detailTab === 1 && <ProcessInspectionTab process={process} showSnackbar={showSnackbar} />}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>닫기</Button>
      </DialogActions>
    </Dialog>
  );
};

// 불량코드 관리 탭
const ProcessDefectTab: React.FC<{ process: Process; showSnackbar: (m: string, s: 'success' | 'error') => void }> = ({ 
  process, showSnackbar 
}) => {
  const [defects, setDefects] = useState<ProcessDefect[]>([]);
  const [defectCodes, setDefectCodes] = useState<CommonDetailCode[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [formData, setFormData] = useState<ProcessDefect>({
    processId: process.processId!, defectCode: '', defectName: '', defectType: '', description: '', useYn: 'Y',
  });

  const fetchDefects = useCallback(async () => {
    try {
      const response = await processService.getProcessDefects(process.processId!);
      if (response.resultCode === 200 && response.result?.resultList) {
        setDefects(response.result.resultList);
      }
    } catch (error) {
      console.error('Failed to fetch defects:', error);
    }
  }, [process.processId]);

  const fetchDefectCodes = useCallback(async () => {
    try {
      const response = await commonCodeService.getCommonDetailCodeList('DEFECT_CODE', 'Y');
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
    const selectedCode = defectCodes.find(dc => dc.code === code);
    if (selectedCode) {
      setFormData({ 
        ...formData, 
        defectCode: selectedCode.code,
        defectName: selectedCode.codeNm,
        description: selectedCode.codeDc || '',
      });
    } else {
      setFormData({ ...formData, defectCode: code });
    }
  };

  const handleSave = async () => {
    try {
      if (dialogMode === 'create') {
        await processService.addProcessDefect(process.processId!, formData);
        showSnackbar('불량코드가 등록되었습니다.', 'success');
      } else {
        await processService.updateProcessDefect(process.processId!, formData.processDefectId!, formData);
        showSnackbar('불량코드가 수정되었습니다.', 'success');
      }
      setOpenDialog(false);
      fetchDefects();
    } catch (error) {
      console.error('Failed to save defect:', error);
      showSnackbar('저장에 실패했습니다.', 'error');
    }
  };

  const handleDelete = async (processDefectId: string) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        await processService.removeProcessDefect(process.processId!, processDefectId);
        showSnackbar('불량코드가 삭제되었습니다.', 'success');
        fetchDefects();
      } catch (error) {
        console.error('Failed to delete defect:', error);
        showSnackbar('삭제에 실패했습니다.', 'error');
      }
    }
  };

  const defectColumns: GridColDef[] = [
    { field: 'defectCode', headerName: '불량 코드', flex: 1, align: 'center', headerAlign: 'center' },
    { field: 'defectName', headerName: '불량명', flex: 1, align: 'center', headerAlign: 'center' },
    { field: 'defectType', headerName: '불량 타입', flex: 1, align: 'center', headerAlign: 'center' },
    { field: 'description', headerName: '설명', flex: 1.5, align: 'center', headerAlign: 'center' },
    {
      field: 'actions', headerName: '관리', flex: 0.8, align: 'center', headerAlign: 'center', sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <Stack direction="row" spacing={1}>
            <IconButton size="small" color="primary" onClick={() => {
              setDialogMode('edit');
              setFormData(params.row);
              setOpenDialog(true);
            }}>
              <EditIcon />
            </IconButton>
            <IconButton size="small" color="error" onClick={() => handleDelete(params.row.processDefectId!)}>
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
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="subtitle2">불량코드 관리</Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => {
              setDialogMode('create');
              setFormData({
                processId: process.processId!, defectCode: '', defectName: '', 
                defectType: '', description: '', useYn: 'Y',
              });
              setOpenDialog(true);
            }}>
              불량코드 추가
            </Button>
          </Stack>
        </CardContent>
      </Card>
      <Paper sx={{ height: 400, width: '100%' }}>
        <DataGrid rows={defects} columns={defectColumns} getRowId={(row) => row.processDefectId || ''}
          hideFooterPagination disableRowSelectionOnClick
          localeText={{ noRowsLabel: '등록된 불량코드가 없습니다' }} />
      </Paper>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{dialogMode === 'create' ? '불량코드 등록' : '불량코드 수정'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth required>
              <InputLabel>불량코드</InputLabel>
              <Select 
                value={formData.defectCode}
                label="불량코드"
                onChange={(e) => handleDefectCodeChange(e.target.value)}
                disabled={dialogMode === 'edit'}
              >
                {defectCodes.map((code) => (
                  <MenuItem key={code.code} value={code.code}>
                    {code.codeNm} ({code.code})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField fullWidth required label="불량명" value={formData.defectName}
              onChange={(e) => setFormData({ ...formData, defectName: e.target.value })} 
              disabled />
            <TextField fullWidth label="불량 타입" value={formData.defectType}
              onChange={(e) => setFormData({ ...formData, defectType: e.target.value })} />
            <TextField fullWidth multiline rows={3} label="설명" value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
              disabled />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSave} variant="contained">저장</Button>
          <Button onClick={() => setOpenDialog(false)}>취소</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// 검사항목 관리 탭
const ProcessInspectionTab: React.FC<{ process: Process; showSnackbar: (m: string, s: 'success' | 'error') => void }> = ({ 
  process, showSnackbar 
}) => {
  const [inspections, setInspections] = useState<ProcessInspection[]>([]);
  const [inspectionCodes, setInspectionCodes] = useState<CommonDetailCode[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [formData, setFormData] = useState<ProcessInspection>({
    processId: process.processId!, inspectionCode: '', inspectionName: '', inspectionType: '',
    standardValue: '', upperLimit: undefined, lowerLimit: undefined, unit: '', description: '', useYn: 'Y',
  });

  const fetchInspections = useCallback(async () => {
    try {
      const response = await processService.getProcessInspections(process.processId!);
      if (response.resultCode === 200 && response.result?.resultList) {
        setInspections(response.result.resultList);
      }
    } catch (error) {
      console.error('Failed to fetch inspections:', error);
    }
  }, [process.processId]);

  const fetchInspectionCodes = useCallback(async () => {
    try {
      const response = await commonCodeService.getCommonDetailCodeList('INSPECTION_CODE', 'Y');
      if (response.resultCode === 200 && response.result?.detailCodeList) {
        setInspectionCodes(response.result.detailCodeList);
      }
    } catch (error) {
      console.error('Failed to fetch inspection codes:', error);
    }
  }, []);

  useEffect(() => {
    fetchInspections();
    fetchInspectionCodes();
  }, [fetchInspections, fetchInspectionCodes]);

  const handleInspectionCodeChange = (code: string) => {
    const selectedCode = inspectionCodes.find(ic => ic.code === code);
    if (selectedCode) {
      setFormData({ 
        ...formData, 
        inspectionCode: selectedCode.code,
        inspectionName: selectedCode.codeNm,
        description: selectedCode.codeDc || '',
      });
    } else {
      setFormData({ ...formData, inspectionCode: code });
    }
  };

  useEffect(() => {
    fetchInspections();
  }, [fetchInspections]);

  const handleSave = async () => {
    try {
      if (dialogMode === 'create') {
        await processService.addProcessInspection(process.processId!, formData);
        showSnackbar('검사항목이 등록되었습니다.', 'success');
      } else {
        await processService.updateProcessInspection(process.processId!, formData.processInspectionId!, formData);
        showSnackbar('검사항목이 수정되었습니다.', 'success');
      }
      setOpenDialog(false);
      fetchInspections();
    } catch (error) {
      console.error('Failed to save inspection:', error);
      showSnackbar('저장에 실패했습니다.', 'error');
    }
  };

  const handleDelete = async (processInspectionId: string) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        await processService.removeProcessInspection(process.processId!, processInspectionId);
        showSnackbar('검사항목이 삭제되었습니다.', 'success');
        fetchInspections();
      } catch (error) {
        console.error('Failed to delete inspection:', error);
        showSnackbar('삭제에 실패했습니다.', 'error');
      }
    }
  };

  const inspectionColumns: GridColDef[] = [
    { field: 'inspectionCode', headerName: '검사 코드', flex: 1, align: 'center', headerAlign: 'center' },
    { field: 'inspectionName', headerName: '검사항목명', flex: 1.2, align: 'center', headerAlign: 'center' },
    { field: 'inspectionType', headerName: '검사 타입', flex: 1, align: 'center', headerAlign: 'center' },
    { field: 'standardValue', headerName: '기준값', flex: 1, align: 'center', headerAlign: 'center' },
    { field: 'upperLimit', headerName: '상한', flex: 0.7, align: 'center', headerAlign: 'center' },
    { field: 'lowerLimit', headerName: '하한', flex: 0.7, align: 'center', headerAlign: 'center' },
    { field: 'unit', headerName: '단위', flex: 0.7, align: 'center', headerAlign: 'center' },
    {
      field: 'actions', headerName: '관리', flex: 0.8, align: 'center', headerAlign: 'center', sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <Stack direction="row" spacing={1}>
            <IconButton size="small" color="primary" onClick={() => {
              setDialogMode('edit');
              setFormData(params.row);
              setOpenDialog(true);
            }}>
              <EditIcon />
            </IconButton>
            <IconButton size="small" color="error" onClick={() => handleDelete(params.row.processInspectionId!)}>
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
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="subtitle2">검사항목 관리</Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => {
              setDialogMode('create');
              setFormData({
                processId: process.processId!, inspectionCode: '', inspectionName: '', inspectionType: '',
                standardValue: '', upperLimit: undefined, lowerLimit: undefined, unit: '', description: '', useYn: 'Y',
              });
              setOpenDialog(true);
            }}>
              검사항목 추가
            </Button>
          </Stack>
        </CardContent>
      </Card>
      <Paper sx={{ height: 400, width: '100%' }}>
        <DataGrid rows={inspections} columns={inspectionColumns} getRowId={(row) => row.processInspectionId || ''}
          hideFooterPagination disableRowSelectionOnClick
          localeText={{ noRowsLabel: '등록된 검사항목이 없습니다' }} />
      </Paper>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{dialogMode === 'create' ? '검사항목 등록' : '검사항목 수정'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Stack direction="row" spacing={2}>
              <FormControl fullWidth required>
                <InputLabel>검사코드</InputLabel>
                <Select 
                  value={formData.inspectionCode}
                  label="검사코드"
                  onChange={(e) => handleInspectionCodeChange(e.target.value)}
                  disabled={dialogMode === 'edit'}
                >
                  {inspectionCodes.map((code) => (
                    <MenuItem key={code.code} value={code.code}>
                      {code.codeNm} ({code.code})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField fullWidth required label="검사항목명" value={formData.inspectionName}
                onChange={(e) => setFormData({ ...formData, inspectionName: e.target.value })} 
                disabled />
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField fullWidth label="검사 타입" value={formData.inspectionType}
                onChange={(e) => setFormData({ ...formData, inspectionType: e.target.value })} />
              <TextField fullWidth label="기준값" value={formData.standardValue}
                onChange={(e) => setFormData({ ...formData, standardValue: e.target.value })} />
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField fullWidth label="상한값" type="number" value={formData.upperLimit || ''}
                onChange={(e) => setFormData({ ...formData, upperLimit: parseFloat(e.target.value) || undefined })} />
              <TextField fullWidth label="하한값" type="number" value={formData.lowerLimit || ''}
                onChange={(e) => setFormData({ ...formData, lowerLimit: parseFloat(e.target.value) || undefined })} />
              <TextField fullWidth label="단위" value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })} />
            </Stack>
            <TextField fullWidth multiline rows={3} label="설명" value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
              disabled />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSave} variant="contained">저장</Button>
          <Button onClick={() => setOpenDialog(false)}>취소</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProcessManagement;
