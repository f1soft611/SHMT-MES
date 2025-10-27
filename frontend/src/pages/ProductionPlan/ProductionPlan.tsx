import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Collapse,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { workplaceService } from '../../services/workplaceService';

interface ProductionPlanData {
  id?: string;
  date: string;
  itemCode: string;
  itemName: string;
  plannedQty: number;
  workplaceCode: string;
  workplaceName?: string;
  shift?: string;
  remark?: string;
}

interface Workplace {
  workplaceId?: string;
  workplaceCode: string;
  workplaceName: string;
  expanded?: boolean;
}

const ProductionPlan: React.FC = () => {
  // 날짜 유틸리티 함수
  const getMonday = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // 월요일로 조정
    return new Date(d.setDate(diff));
  };

  const formatDate = (date: Date, format: string): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const dayName = dayNames[date.getDay()];

    return format
      .replace('YYYY', String(year))
      .replace('MM', month)
      .replace('DD', day)
      .replace('ddd', dayName);
  };

  const addDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  const isSameDay = (date1: Date, date2: Date): boolean => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  // 현재 주의 시작일 (월요일)
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(
    getMonday(new Date())
  );

  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // 폼 데이터
  const [formData, setFormData] = useState<ProductionPlanData>({
    date: '',
    itemCode: '',
    itemName: '',
    plannedQty: 0,
    workplaceCode: '',
    workplaceName: '',
    shift: 'DAY',
    remark: '',
  });

  // 검색 조건
  const [searchValues, setSearchValues] = useState({
    itemCode: '',
    itemName: '',
    workplaceCode: '',
  });

  // 모의 데이터 (백엔드 연동 전 임시)
  const [plans, setPlans] = useState<ProductionPlanData[]>([]);
  const [workplaces, setWorkplaces] = useState<Workplace[]>([]);
  const [expandedWorkplaces, setExpandedWorkplaces] = useState<Set<string>>(new Set());

  // 작업장 목록 로드
  useEffect(() => {
    loadWorkplaces();
  }, []);

  const loadWorkplaces = async () => {
    try {
      const response = await workplaceService.getWorkplaceList(0, 100);
      if (response.resultCode === 200 && response.result?.resultList) {
        const workplaceList = response.result.resultList.map((wp: any) => ({
          workplaceId: wp.workplaceId,
          workplaceCode: wp.workplaceCode,
          workplaceName: wp.workplaceName,
          expanded: false,
        }));
        setWorkplaces(workplaceList);
        // 기본적으로 모든 설비 펼쳐두기
        setExpandedWorkplaces(new Set(workplaceList.map((wp: Workplace) => wp.workplaceCode)));
      }
    } catch (error) {
      console.error('Failed to load workplaces:', error);
      // 백엔드 연동 전 모의 데이터
      const mockWorkplaces = [
        { workplaceCode: 'WP-001', workplaceName: '설비1', expanded: true },
        { workplaceCode: 'WP-002', workplaceName: '설비2', expanded: true },
        { workplaceCode: 'WP-003', workplaceName: '설비3', expanded: true },
      ];
      setWorkplaces(mockWorkplaces);
      setExpandedWorkplaces(new Set(mockWorkplaces.map(wp => wp.workplaceCode)));
    }
  };

  const toggleWorkplace = (workplaceCode: string) => {
    const newExpanded = new Set(expandedWorkplaces);
    if (newExpanded.has(workplaceCode)) {
      newExpanded.delete(workplaceCode);
    } else {
      newExpanded.add(workplaceCode);
    }
    setExpandedWorkplaces(newExpanded);
  };

  // 일주일 날짜 배열 생성 (월-금)
  const getWeekDays = (): Date[] => {
    const days: Date[] = [];
    for (let i = 0; i < 5; i++) {  // 월-금만 표시 (0-4)
      days.push(addDays(currentWeekStart, i));
    }
    return days;
  };

  const weekDays = getWeekDays();

  // 다음 주로 이동
  const handleNextWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, 7));
  };

  // 이전 주로 이동
  const handlePrevWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, -7));
  };

  // 오늘로 이동
  const handleToday = () => {
    setCurrentWeekStart(getMonday(new Date()));
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleOpenCreateDialog = (date: string, workplaceCode?: string) => {
    setDialogMode('create');
    setSelectedDate(date);
    setFormData({
      date,
      itemCode: '',
      itemName: '',
      plannedQty: 0,
      workplaceCode: workplaceCode || '',
      workplaceName: '',
      shift: 'DAY',
      remark: '',
    });
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (plan: ProductionPlanData) => {
    setDialogMode('edit');
    setFormData(plan);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleChange = (field: keyof ProductionPlanData, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSearchChange = (field: string, value: string) => {
    setSearchValues({ ...searchValues, [field]: value });
  };

  const handleSearch = () => {
    // 검색 로직 (백엔드 연동 시 구현)
    showSnackbar('검색 기능은 백엔드 연동 후 구현됩니다.', 'success');
  };

  const handleSave = () => {
    if (!formData.itemCode || !formData.itemName || formData.plannedQty <= 0 || !formData.workplaceCode) {
      showSnackbar('필수 항목을 입력해주세요.', 'error');
      return;
    }

    if (dialogMode === 'create') {
      const newPlan: ProductionPlanData = {
        ...formData,
        id: Date.now().toString(),
      };
      setPlans([...plans, newPlan]);
      showSnackbar('생산계획이 등록되었습니다.', 'success');
    } else {
      setPlans(
        plans.map((p) => (p.id === formData.id ? formData : p))
      );
      showSnackbar('생산계획이 수정되었습니다.', 'success');
    }

    handleCloseDialog();
  };

  const handleDelete = (planId: string) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      setPlans(plans.filter((p) => p.id !== planId));
      showSnackbar('생산계획이 삭제되었습니다.', 'success');
    }
  };

  // 특정 날짜와 작업장의 생산계획 가져오기
  const getPlansForDateAndWorkplace = (date: string, workplaceCode: string) => {
    return plans.filter((p) => p.date === date && p.workplaceCode === workplaceCode);
  };

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
          <Typography variant="h5">생산계획 수립</Typography>
        </Box>
      </Box>

      {/* 검색 영역 */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            size="small"
            label="품목코드"
            value={searchValues.itemCode}
            onChange={(e) => handleSearchChange('itemCode', e.target.value)}
            sx={{ minWidth: 150 }}
          />
          <TextField
            size="small"
            label="품목명"
            value={searchValues.itemName}
            onChange={(e) => handleSearchChange('itemName', e.target.value)}
            sx={{ minWidth: 200 }}
          />
          <TextField
            size="small"
            label="작업장"
            value={searchValues.workplaceCode}
            onChange={(e) =>
              handleSearchChange('workplaceCode', e.target.value)
            }
            sx={{ minWidth: 150 }}
          />
          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={handleSearch}
          >
            검색
          </Button>
        </Stack>
      </Paper>

      {/* 주간 네비게이션 */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="center"
        >
          <IconButton onClick={handlePrevWeek} color="primary">
            <NavigateBeforeIcon />
          </IconButton>

          <Typography variant="h6" sx={{ minWidth: 300, textAlign: 'center' }}>
            {formatDate(currentWeekStart, 'YYYY년 MM월 DD일')} ~{' '}
            {formatDate(addDays(currentWeekStart, 4), 'MM월 DD일')} (월-금)
          </Typography>

          <IconButton onClick={handleNextWeek} color="primary">
            <NavigateNextIcon />
          </IconButton>

          <Button variant="outlined" onClick={handleToday}>
            오늘
          </Button>
        </Stack>
      </Paper>

      {/* 주간 그리드 - 설비별 생산계획 */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 400px)' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    minWidth: 200,
                    backgroundColor: 'primary.main',
                    color: 'white',
                    fontWeight: 'bold',
                  }}
                >
                  설비
                </TableCell>
                {weekDays.map((day) => {
                  const isToday = isSameDay(day, new Date());
                  const dateStr = formatDate(day, 'YYYY-MM-DD');
                  return (
                    <TableCell
                      key={dateStr}
                      align="center"
                      sx={{
                        minWidth: 180,
                        backgroundColor: isToday
                          ? 'warning.main'
                          : 'primary.main',
                        color: 'white',
                        fontWeight: 'bold',
                      }}
                    >
                      <Box>
                        <Typography variant="body2">
                          {formatDate(day, 'ddd')}
                        </Typography>
                        <Typography variant="h6">
                          {formatDate(day, 'MM/DD')}
                        </Typography>
                      </Box>
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableHead>
            <TableBody>
              {workplaces.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      등록된 설비가 없습니다.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                workplaces.map((workplace) => {
                  const isExpanded = expandedWorkplaces.has(workplace.workplaceCode);
                  return (
                    <React.Fragment key={workplace.workplaceCode}>
                      <TableRow sx={{ '&:hover': { backgroundColor: 'action.hover' } }}>
                        <TableCell 
                          sx={{ 
                            fontWeight: 'bold',
                            backgroundColor: 'grey.100',
                            cursor: 'pointer',
                          }}
                          onClick={() => toggleWorkplace(workplace.workplaceCode)}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <IconButton size="small" sx={{ mr: 1 }}>
                              {isExpanded ? <ExpandMoreIcon /> : <ChevronRightIcon />}
                            </IconButton>
                            <Box>
                              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                {workplace.workplaceName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {workplace.workplaceCode}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        {weekDays.map((day) => {
                          const dateStr = formatDate(day, 'YYYY-MM-DD');
                          const dayPlans = getPlansForDateAndWorkplace(dateStr, workplace.workplaceCode);
                          return (
                            <TableCell
                              key={dateStr}
                              sx={{
                                verticalAlign: 'top',
                                backgroundColor: 'grey.50',
                                p: 1,
                              }}
                            >
                              <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                <Box sx={{ minHeight: 80 }}>
                                  <Button
                                    fullWidth
                                    size="small"
                                    startIcon={<AddIcon />}
                                    onClick={() => handleOpenCreateDialog(dateStr, workplace.workplaceCode)}
                                    variant="outlined"
                                    sx={{ mb: 1 }}
                                  >
                                    등록
                                  </Button>

                                  <Stack spacing={1}>
                                    {dayPlans.map((plan) => (
                                      <Paper
                                        key={plan.id}
                                        elevation={2}
                                        sx={{
                                          p: 1,
                                          '&:hover': {
                                            backgroundColor: 'action.hover',
                                          },
                                        }}
                                      >
                                        <Box
                                          sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'flex-start',
                                          }}
                                        >
                                          <Box sx={{ flex: 1 }}>
                                            <Typography
                                              variant="caption"
                                              color="text.secondary"
                                            >
                                              {plan.itemCode}
                                            </Typography>
                                            <Typography
                                              variant="body2"
                                              sx={{ fontWeight: 'bold' }}
                                            >
                                              {plan.itemName}
                                            </Typography>
                                            <Typography variant="body2" color="primary">
                                              {plan.plannedQty.toLocaleString()}
                                            </Typography>
                                            {plan.shift && (
                                              <Chip
                                                label={
                                                  plan.shift === 'DAY' ? '주간' : '야간'
                                                }
                                                size="small"
                                                color={
                                                  plan.shift === 'DAY'
                                                    ? 'primary'
                                                    : 'default'
                                                }
                                                sx={{ mt: 0.5 }}
                                              />
                                            )}
                                          </Box>
                                          <Box>
                                            <IconButton
                                              size="small"
                                              onClick={() => handleOpenEditDialog(plan)}
                                              title="수정"
                                            >
                                              <EditIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton
                                              size="small"
                                              color="error"
                                              onClick={() => plan.id && handleDelete(plan.id)}
                                              title="삭제"
                                            >
                                              <DeleteIcon fontSize="small" />
                                            </IconButton>
                                          </Box>
                                        </Box>
                                      </Paper>
                                    ))}
                                  </Stack>
                                </Box>
                              </Collapse>
                              {!isExpanded && dayPlans.length > 0 && (
                                <Typography variant="caption" color="text.secondary">
                                  {dayPlans.length}개 계획
                                </Typography>
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    </React.Fragment>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* 등록/수정 다이얼로그 */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {dialogMode === 'create' ? '생산계획 등록' : '생산계획 수정'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="계획일자"
              value={
                dialogMode === 'create'
                  ? selectedDate
                  : formData.date
              }
              disabled
            />
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                required
                label="품목코드"
                value={formData.itemCode}
                onChange={(e) => handleChange('itemCode', e.target.value)}
                placeholder="예: PROD-001"
              />
              <TextField
                fullWidth
                required
                label="품목명"
                value={formData.itemName}
                onChange={(e) => handleChange('itemName', e.target.value)}
                placeholder="예: 제품A"
              />
            </Stack>
            <TextField
              fullWidth
              required
              type="number"
              label="계획수량"
              value={formData.plannedQty}
              onChange={(e) =>
                handleChange('plannedQty', parseInt(e.target.value) || 0)
              }
              InputProps={{
                inputProps: { min: 0 },
              }}
            />
            <Stack direction="row" spacing={2}>
              <FormControl fullWidth>
                <InputLabel>작업장</InputLabel>
                <Select
                  value={formData.workplaceCode}
                  label="작업장"
                  onChange={(e) => {
                    const selectedWorkplace = workplaces.find(wp => wp.workplaceCode === e.target.value);
                    handleChange('workplaceCode', e.target.value);
                    if (selectedWorkplace) {
                      handleChange('workplaceName', selectedWorkplace.workplaceName);
                    }
                  }}
                  required
                >
                  {workplaces.map((wp) => (
                    <MenuItem key={wp.workplaceCode} value={wp.workplaceCode}>
                      {wp.workplaceName} ({wp.workplaceCode})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="작업장명"
                value={formData.workplaceName}
                disabled
                placeholder="작업장 선택 시 자동 입력"
              />
            </Stack>
            <FormControl fullWidth>
              <InputLabel>근무조</InputLabel>
              <Select
                value={formData.shift}
                label="근무조"
                onChange={(e) => handleChange('shift', e.target.value)}
              >
                <MenuItem value="DAY">주간</MenuItem>
                <MenuItem value="NIGHT">야간</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="비고"
              value={formData.remark}
              onChange={(e) => handleChange('remark', e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSave} variant="contained" color="primary">
            저장
          </Button>
          <Button onClick={handleCloseDialog}>취소</Button>
        </DialogActions>
      </Dialog>

      {/* 스낵바 */}
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

export default ProductionPlan;
