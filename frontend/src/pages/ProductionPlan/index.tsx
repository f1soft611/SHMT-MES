import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
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
  Card,
  CardContent,
  Tooltip,
  Badge,
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
  CalendarToday as CalendarTodayIcon,
  FilterList as FilterListIcon,
  ViewWeek as ViewWeekIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { workplaceService } from '../../services/workplaceService';
import PlanDialog from './components/PlanDialog';

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
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
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

  const isWeekend = (date: Date): boolean => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

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

  const [searchValues, setSearchValues] = useState({
    itemCode: '',
    itemName: '',
    workplaceCode: '',
  });

  const [plans, setPlans] = useState<ProductionPlanData[]>([]);
  const [workplaces, setWorkplaces] = useState<Workplace[]>([]);
  const [expandedWorkplaces, setExpandedWorkplaces] = useState<Set<string>>(
    new Set()
  );
  const [showSearchPanel, setShowSearchPanel] = useState(false);

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
        setExpandedWorkplaces(
          new Set(workplaceList.map((wp: Workplace) => wp.workplaceCode))
        );
      }
    } catch (error) {
      console.error('Failed to load workplaces:', error);
      const mockWorkplaces = [
        { workplaceCode: 'WP-001', workplaceName: '설비1', expanded: true },
        { workplaceCode: 'WP-002', workplaceName: '설비2', expanded: true },
        { workplaceCode: 'WP-003', workplaceName: '설비3', expanded: true },
      ];
      setWorkplaces(mockWorkplaces);
      setExpandedWorkplaces(
        new Set(mockWorkplaces.map((wp) => wp.workplaceCode))
      );
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

  const getWeekDays = (): Date[] => {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      days.push(addDays(currentWeekStart, i));
    }
    return days;
  };

  const weekDays = getWeekDays();

  const handleNextWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, 7));
  };

  const handlePrevWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, -7));
  };

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
    showSnackbar('검색 기능은 백엔드 연동 후 구현됩니다.', 'success');
  };

  const handleSave = () => {
    if (
      !formData.itemCode ||
      !formData.itemName ||
      formData.plannedQty <= 0 ||
      !formData.workplaceCode
    ) {
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
      setPlans(plans.map((p) => (p.id === formData.id ? formData : p)));
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

  const getPlansForDateAndWorkplace = (date: string, workplaceCode: string) => {
    return plans.filter(
      (p) => p.date === date && p.workplaceCode === workplaceCode
    );
  };

  const getTotalPlansForDate = (date: string) => {
    return plans.filter((p) => p.date === date).length;
  };

  const getTotalQtyForDate = (date: string) => {
    return plans
      .filter((p) => p.date === date)
      .reduce((sum, p) => sum + p.plannedQty, 0);
  };

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#f5f7fa',
      }}
    >
      {/* 헤더 영역 */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 2,
          bgcolor: 'white',
          borderBottom: '3px solid',
          borderColor: 'primary.main',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                p: 1.5,
                bgcolor: 'primary.main',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ViewWeekIcon sx={{ fontSize: 32, color: 'white' }} />
            </Box>
            <Box>
              <Typography
                variant="h4"
                sx={{ color: 'text.primary', fontWeight: 700 }}
              >
                생산계획 수립
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: 'text.secondary', mt: 0.5 }}
              >
                주간 생산 일정을 관리하고 계획하세요
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="검색 필터">
              <IconButton
                onClick={() => setShowSearchPanel(!showSearchPanel)}
                sx={{
                  bgcolor: showSearchPanel ? 'primary.main' : 'grey.100',
                  color: showSearchPanel ? 'white' : 'text.secondary',
                  '&:hover': {
                    bgcolor: showSearchPanel ? 'primary.dark' : 'grey.200',
                  },
                }}
              >
                <FilterListIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="새로고침">
              <IconButton
                onClick={loadWorkplaces}
                sx={{
                  bgcolor: 'grey.100',
                  color: 'text.secondary',
                  '&:hover': { bgcolor: 'grey.200' },
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Paper>

      {/* 검색 영역 */}
      <Collapse in={showSearchPanel}>
        <Card sx={{ mb: 2, boxShadow: 2 }}>
          <CardContent>
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                fontWeight: 600,
              }}
            >
              <FilterListIcon color="primary" />
              검색 필터
            </Typography>
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              flexWrap="wrap"
            >
              <TextField
                size="small"
                label="품목코드"
                value={searchValues.itemCode}
                onChange={(e) => handleSearchChange('itemCode', e.target.value)}
                sx={{ minWidth: 180 }}
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
                sx={{ minWidth: 180 }}
              />
              <Button
                variant="contained"
                startIcon={<SearchIcon />}
                onClick={handleSearch}
              >
                검색
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Collapse>

      {/* 주간 네비게이션 */}
      <Card sx={{ mb: 2, boxShadow: 2 }}>
        <CardContent>
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            justifyContent="center"
          >
            <Tooltip title="이전 주">
              <IconButton
                onClick={handlePrevWeek}
                sx={{
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': { bgcolor: 'primary.dark' },
                }}
              >
                <NavigateBeforeIcon />
              </IconButton>
            </Tooltip>

            <Box sx={{ textAlign: 'center', minWidth: 350 }}>
              <Typography
                variant="h5"
                sx={{ fontWeight: 700, color: 'primary.main' }}
              >
                {formatDate(currentWeekStart, 'YYYY년 MM월 DD일')} ~{' '}
                {formatDate(addDays(currentWeekStart, 6), 'MM월 DD일')}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                월요일 - 일요일
              </Typography>
            </Box>

            <Tooltip title="다음 주">
              <IconButton
                onClick={handleNextWeek}
                sx={{
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': { bgcolor: 'primary.dark' },
                }}
              >
                <NavigateNextIcon />
              </IconButton>
            </Tooltip>

            <Button
              variant="contained"
              color="warning"
              startIcon={<CalendarTodayIcon />}
              onClick={handleToday}
            >
              오늘
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* 주간 그리드 */}
      <Paper sx={{ flex: 1, overflow: 'hidden', boxShadow: 2 }}>
        <TableContainer sx={{ height: '100%' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    minWidth: 200,
                    bgcolor: 'primary.main',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    borderRight: '1px solid rgba(224, 224, 224, 1)',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ViewWeekIcon />
                    설비
                  </Box>
                </TableCell>
                {weekDays.map((day) => {
                  const isToday = isSameDay(day, new Date());
                  const isWeekendDay = isWeekend(day);
                  const dateStr = formatDate(day, 'YYYY-MM-DD');
                  const totalPlans = getTotalPlansForDate(dateStr);
                  const totalQty = getTotalQtyForDate(dateStr);

                  return (
                    <TableCell
                      key={dateStr}
                      align="center"
                      sx={{
                        minWidth: 180,
                        bgcolor: isToday
                          ? 'warning.main'
                          : isWeekendDay
                          ? 'grey.400'
                          : 'primary.main',
                        color: 'white',
                        fontWeight: 'bold',
                        borderRight: '1px solid rgba(224, 224, 224, 1)',
                      }}
                    >
                      <Box>
                        <Typography variant="caption" sx={{ opacity: 0.9 }}>
                          {formatDate(day, 'ddd')}요일
                        </Typography>
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 700, my: 0.5 }}
                        >
                          {formatDate(day, 'MM/DD')}
                        </Typography>
                        {totalPlans > 0 && (
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'center',
                              gap: 1,
                              mt: 1,
                            }}
                          >
                            <Badge badgeContent={totalPlans} color="error">
                              <Chip
                                label={`${totalQty.toLocaleString()}`}
                                size="small"
                                sx={{
                                  bgcolor: 'rgba(255,255,255,0.9)',
                                  color: 'primary.main',
                                  fontWeight: 'bold',
                                }}
                              />
                            </Badge>
                          </Box>
                        )}
                      </Box>
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableHead>
            <TableBody>
              {workplaces.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                    <Box sx={{ opacity: 0.6 }}>
                      <ViewWeekIcon
                        sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }}
                      />
                      <Typography variant="h6" color="text.secondary">
                        등록된 설비가 없습니다.
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 1 }}
                      >
                        설비를 먼저 등록해주세요.
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                workplaces.map((workplace, index) => {
                  const isExpanded = expandedWorkplaces.has(
                    workplace.workplaceCode
                  );
                  return (
                    <React.Fragment key={workplace.workplaceCode}>
                      <TableRow
                        sx={{
                          '&:hover': { backgroundColor: 'action.hover' },
                          bgcolor: index % 2 === 0 ? 'white' : 'grey.50',
                        }}
                      >
                        <TableCell
                          sx={{
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            borderRight: '1px solid',
                            borderColor: 'divider',
                          }}
                          onClick={() =>
                            toggleWorkplace(workplace.workplaceCode)
                          }
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <IconButton
                              size="small"
                              sx={{
                                mr: 1,
                                bgcolor: 'primary.main',
                                color: 'white',
                                '&:hover': { bgcolor: 'primary.dark' },
                                width: 32,
                                height: 32,
                              }}
                            >
                              {isExpanded ? (
                                <ExpandMoreIcon fontSize="small" />
                              ) : (
                                <ChevronRightIcon fontSize="small" />
                              )}
                            </IconButton>
                            <Box>
                              <Typography
                                variant="body1"
                                sx={{ fontWeight: 700, color: 'text.primary' }}
                              >
                                {workplace.workplaceName}
                              </Typography>
                              <Chip
                                label={workplace.workplaceCode}
                                size="small"
                                sx={{ mt: 0.5 }}
                              />
                            </Box>
                          </Box>
                        </TableCell>
                        {weekDays.map((day) => {
                          const dateStr = formatDate(day, 'YYYY-MM-DD');
                          const dayPlans = getPlansForDateAndWorkplace(
                            dateStr,
                            workplace.workplaceCode
                          );
                          const isWeekendDay = isWeekend(day);

                          return (
                            <TableCell
                              key={dateStr}
                              sx={{
                                verticalAlign: 'top',
                                backgroundColor: isWeekendDay
                                  ? 'grey.100'
                                  : 'white',
                                p: 1.5,
                                borderRight: '1px solid',
                                borderColor: 'divider',
                              }}
                            >
                              <Collapse
                                in={isExpanded}
                                timeout="auto"
                                unmountOnExit
                              >
                                <Box sx={{ minHeight: 100 }}>
                                  <Button
                                    fullWidth
                                    size="small"
                                    startIcon={<AddIcon />}
                                    onClick={() =>
                                      handleOpenCreateDialog(
                                        dateStr,
                                        workplace.workplaceCode
                                      )
                                    }
                                    variant="contained"
                                    sx={{ mb: 1.5 }}
                                  >
                                    계획 추가
                                  </Button>

                                  <Stack spacing={1.5}>
                                    {dayPlans.map((plan) => (
                                      <Card
                                        key={plan.id}
                                        elevation={2}
                                        sx={{
                                          '&:hover': {
                                            boxShadow: 4,
                                            transform: 'translateY(-2px)',
                                          },
                                          transition: 'all 0.2s ease',
                                          borderLeft: '4px solid',
                                          borderColor:
                                            plan.shift === 'DAY'
                                              ? 'primary.main'
                                              : 'warning.main',
                                        }}
                                      >
                                        <CardContent
                                          sx={{
                                            p: 1.5,
                                            '&:last-child': { pb: 1.5 },
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
                                              <Chip
                                                label={plan.itemCode}
                                                size="small"
                                                color="primary"
                                                variant="outlined"
                                                sx={{ mb: 0.5 }}
                                              />
                                              <Typography
                                                variant="body2"
                                                sx={{
                                                  fontWeight: 600,
                                                  color: 'text.primary',
                                                  my: 0.5,
                                                }}
                                              >
                                                {plan.itemName}
                                              </Typography>
                                              <Box
                                                sx={{
                                                  display: 'flex',
                                                  alignItems: 'center',
                                                  gap: 1,
                                                  mt: 1,
                                                }}
                                              >
                                                <Chip
                                                  label={`${plan.plannedQty.toLocaleString()} 개`}
                                                  size="small"
                                                  color="success"
                                                />
                                                <Chip
                                                  label={
                                                    plan.shift === 'DAY'
                                                      ? '주간'
                                                      : '야간'
                                                  }
                                                  size="small"
                                                  color={
                                                    plan.shift === 'DAY'
                                                      ? 'primary'
                                                      : 'warning'
                                                  }
                                                />
                                              </Box>
                                            </Box>
                                            <Box
                                              sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: 0.5,
                                              }}
                                            >
                                              <Tooltip title="수정">
                                                <IconButton
                                                  size="small"
                                                  onClick={() =>
                                                    handleOpenEditDialog(plan)
                                                  }
                                                  sx={{
                                                    bgcolor: 'info.light',
                                                    color: 'white',
                                                    '&:hover': {
                                                      bgcolor: 'info.main',
                                                    },
                                                  }}
                                                >
                                                  <EditIcon fontSize="small" />
                                                </IconButton>
                                              </Tooltip>
                                              <Tooltip title="삭제">
                                                <IconButton
                                                  size="small"
                                                  onClick={() =>
                                                    plan.id &&
                                                    handleDelete(plan.id)
                                                  }
                                                  sx={{
                                                    bgcolor: 'error.light',
                                                    color: 'white',
                                                    '&:hover': {
                                                      bgcolor: 'error.main',
                                                    },
                                                  }}
                                                >
                                                  <DeleteIcon fontSize="small" />
                                                </IconButton>
                                              </Tooltip>
                                            </Box>
                                          </Box>
                                        </CardContent>
                                      </Card>
                                    ))}
                                  </Stack>
                                </Box>
                              </Collapse>
                              {!isExpanded && dayPlans.length > 0 && (
                                <Chip
                                  label={`${dayPlans.length}건`}
                                  size="small"
                                  color="primary"
                                />
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
      {/* 등록/수정 다이얼로그 */}
      <PlanDialog
        open={openDialog}
        onClose={handleCloseDialog}
        dialogMode={dialogMode}
        selectedDate={selectedDate}
        formData={formData}
        workplaces={workplaces}
        onSave={handleSave}
        onChange={handleChange}
      />


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
