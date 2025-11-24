import React, { useState, useEffect, useCallback } from 'react';
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
  Checkbox,
  FormControlLabel,
  FormGroup,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import equipmentService from '../../services/equipmentService';
import workplaceService from '../../services/workplaceService';
import productionPlanService, {
  ProductionPlanRequest,
} from '../../services/productionPlanService';
import { Equipment } from '../../types/equipment';
import { Workplace, WorkplaceWorker } from '../../types/workplace';
import PlanDialog from './components/PlanDialog';

// localStorage 키 상수
const STORAGE_KEY_DAY_FILTER = 'productionPlan_visibleDays';
const STORAGE_KEY_LAST_DATE = 'productionPlan_lastAccessDate';

interface ProductionPlanData {
  id?: string;
  date: string;
  itemCode: string;
  itemName: string;
  plannedQty: number;
  equipmentCode: string;
  equipmentName?: string;
  shift?: string;
  remark?: string;
  orderNo?: string;
  orderSeqno?: number;
  orderHistno?: number;
  workplaceCode?: string;
  workplaceName?: string;
  workerCode?: string;
  workerName?: string;
  customerCode?: string;
  customerName?: string;
  additionalCustomers?: string[]; // 추가 거래처 목록
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
    equipmentCode: '',
    equipmentName: '',
    shift: 'DAY',
    remark: '',
  });

  const [searchValues, setSearchValues] = useState({
    itemCode: '',
    itemName: '',
    equipmentCode: '',
  });

  const [plans, setPlans] = useState<ProductionPlanData[]>([]);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [workplaces, setWorkplaces] = useState<Workplace[]>([]);
  const [selectedWorkplace, setSelectedWorkplace] = useState<string>('');
  const [workplaceWorkers, setWorkplaceWorkers] = useState<WorkplaceWorker[]>(
    []
  );
  const [expandedEquipments, setExpandedEquipments] = useState<Set<string>>(
    new Set()
  );
  const [showSearchPanel, setShowSearchPanel] = useState(false);

  // 기본 3일 표시 (어제, 오늘, 내일)를 위한 함수
  const getDefault3DaysFilter = (): boolean[] => {
    const today = new Date();
    const todayDayOfWeek = today.getDay(); // 0(일) ~ 6(토)
    const mondayBasedDay = todayDayOfWeek === 0 ? 6 : todayDayOfWeek - 1; // 0(월) ~ 6(일)

    const filter = [false, false, false, false, false, false, false];

    // 어제 (월요일일 때 일요일로 wrap)
    const yesterday = mondayBasedDay - 1;
    if (yesterday >= 0) {
      filter[yesterday] = true;
    } else {
      filter[6] = true; // 일요일
    }

    // 오늘
    filter[mondayBasedDay] = true;

    // 내일 (일요일일 때 월요일로 wrap)
    const tomorrow = mondayBasedDay + 1;
    if (tomorrow < 7) {
      filter[tomorrow] = true;
    } else {
      filter[0] = true; // 월요일
    }

    return filter;
  };

  // localStorage에 필터 저장하는 헬퍼 함수
  const saveFilterToStorage = (filter: boolean[]) => {
    try {
      const currentDate = formatDate(new Date(), 'YYYY-MM-DD');
      localStorage.setItem(STORAGE_KEY_DAY_FILTER, JSON.stringify(filter));
      localStorage.setItem(STORAGE_KEY_LAST_DATE, currentDate);
    } catch (error) {
      console.error('Failed to save day filter to localStorage:', error);
    }
  };

  // 날짜가 변경되었는지 확인하고 필터 초기화하는 함수
  const checkAndResetIfDateChanged = (): boolean[] | null => {
    try {
      const lastAccessDate = localStorage.getItem(STORAGE_KEY_LAST_DATE);
      const currentDate = formatDate(new Date(), 'YYYY-MM-DD');

      // 날짜가 변경되었으면 기본 3일로 초기화
      if (lastAccessDate && lastAccessDate !== currentDate) {
        const default3Days = getDefault3DaysFilter();
        saveFilterToStorage(default3Days);
        return default3Days;
      }
    } catch (error) {
      console.error('Failed to check date change:', error);
    }
    return null;
  };

  // localStorage에서 저장된 필터 로드 또는 기본값 사용
  const loadVisibleDaysFromStorage = (): boolean[] => {
    try {
      // 날짜 변경 확인
      const resetFilter = checkAndResetIfDateChanged();
      if (resetFilter) {
        return resetFilter;
      }

      // 저장된 필터 로드
      const saved = localStorage.getItem(STORAGE_KEY_DAY_FILTER);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 7) {
          return parsed;
        }
      }

      // 첫 방문이거나 데이터가 없으면 기본 3일로 초기화
      const default3Days = getDefault3DaysFilter();
      saveFilterToStorage(default3Days);
      return default3Days;
    } catch (error) {
      console.error('Failed to load day filter from localStorage:', error);
      // 오류 시 기본 3일 표시
      return getDefault3DaysFilter();
    }
  };

  // 요일별 표시 상태 (월~일) - lazy initialization
  const [visibleDays, setVisibleDays] = useState<boolean[]>(() =>
    loadVisibleDaysFromStorage()
  );
  const [showDayFilter, setShowDayFilter] = useState(false);

  const loadEquipments = useCallback(async () => {
    try {
      const response = await equipmentService.getEquipmentList(0, 100);
      if (response.resultCode === 200 && response.result?.resultList) {
        const equipmentList = response.result.resultList.map((eq: any) => ({
          equipmentId: eq.equipmentId,
          equipCd: eq.equipCd,
          equipmentName: eq.equipmentName,
        }));
        setEquipments(equipmentList);
        setExpandedEquipments(
          new Set(equipmentList.map((eq: Equipment) => eq.equipCd))
        );
      }
    } catch (error) {
      console.error('Failed to load equipments:', error);
      const mockEquipments = [
        { equipCd: 'EQ-001', equipmentName: '설비1' },
        { equipCd: 'EQ-002', equipmentName: '설비2' },
        { equipCd: 'EQ-003', equipmentName: '설비3' },
      ];
      setEquipments(mockEquipments as Equipment[]);
      setExpandedEquipments(new Set(mockEquipments.map((eq) => eq.equipCd)));
    }
  }, []);

  const loadWorkplaces = useCallback(async () => {
    try {
      const response = await workplaceService.getWorkplaceList(0, 100);
      if (response.resultCode === 200 && response.result?.resultList) {
        setWorkplaces(response.result.resultList);
      }
    } catch (error) {
      console.error('Failed to load workplaces:', error);
      // Mock data for development
      const mockWorkplaces = [
        { workplaceCode: 'WP001', workplaceName: '작업장1' },
        { workplaceCode: 'WP002', workplaceName: '작업장2' },
      ];
      setWorkplaces(mockWorkplaces as Workplace[]);
      loadEquipments();
    }
  }, [loadEquipments]);

  const loadEquipmentsByWorkplace = useCallback(
    async (workplaceCode: string) => {
      try {
        // 작업장별 설비 조회 (설비연동된 공정의 설비들)
        const response = await workplaceService.getWorkplaceEquipments(
          workplaceCode
        );

        if (response.resultCode === 200 && response.result?.resultList) {
          const equipmentList = response.result.resultList.map((eq: any) => ({
            equipCd: eq.equipCd,
            equipmentName: eq.equipmentName,
            equipmentId: eq.equipmentId,
          }));

          setEquipments(equipmentList);
          setExpandedEquipments(
            new Set(equipmentList.map((eq: Equipment) => eq.equipCd))
          );
        }
      } catch (error) {
        console.error('Failed to load equipments:', error);
        // Fallback to loading all equipments if workplace-specific loading fails
        loadEquipments();
      }
    },
    [loadEquipments]
  );

  const loadWorkplaceWorkers = useCallback(async (workplaceCode: string) => {
    try {
      const response = await workplaceService.getWorkplaceWorkers(
        workplaceCode
      );
      if (response.resultCode === 200 && response.result?.resultList) {
        setWorkplaceWorkers(response.result.resultList);
      }
    } catch (error) {
      console.error('Failed to load workplace workers:', error);
      setWorkplaceWorkers([]);
    }
  }, []);

  const loadWeeklyPlans = useCallback(async () => {
    if (!selectedWorkplace) return;

    const weekStart = currentWeekStart;
    const weekEnd = addDays(currentWeekStart, 6);

    try {
      const response = await productionPlanService.getProductionPlans({
        startDate: formatDate(weekStart, 'YYYYMMDD'),
        endDate: formatDate(weekEnd, 'YYYYMMDD'),
        workplaceCode: selectedWorkplace,
      });

      if (response.resultCode === 200 && response.result?.resultList) {
        // Map API response to frontend model
        const mappedPlans: ProductionPlanData[] =
          response.result.resultList.map((p: any) => {
            // Convert YYYYMMDD to YYYY-MM-DD
            const formattedDate = p.planDate.replace(
              /(\d{4})(\d{2})(\d{2})/,
              '$1-$2-$3'
            );

            return {
              id: `${p.planNo}-${p.planSeq}`,
              date: formattedDate,
              itemCode: p.itemCode,
              itemName: p.itemName,
              plannedQty: p.plannedQty,
              equipmentCode: p.equipmentCode,
              equipmentName: p.equipmentName,
              shift: p.shift,
              remark: p.remark,
              orderNo: p.orderNo,
              orderSeqno: p.orderSeqno,
              orderHistno: p.orderHistno,
              workplaceCode: selectedWorkplace,
              workerCode: p.workerCode,
              workerName: p.workerName,
              customerCode: p.customerCode,
              customerName: p.customerName,
            };
          });
        setPlans(mappedPlans);
      }
    } catch (error) {
      console.error('Failed to load production plans:', error);
      showSnackbar('생산계획 조회에 실패했습니다.', 'error');
    }
  }, [currentWeekStart, selectedWorkplace]);

  useEffect(() => {
    loadWorkplaces();
    // 날짜 변경 체크는 컴포넌트 마운트 시 loadVisibleDaysFromStorage()에서 자동으로 수행됨
  }, [loadWorkplaces]);

  useEffect(() => {
    if (selectedWorkplace) {
      loadEquipmentsByWorkplace(selectedWorkplace);
      loadWorkplaceWorkers(selectedWorkplace);
    } else {
      setEquipments([]);
      setWorkplaceWorkers([]);
      setPlans([]);
    }
  }, [selectedWorkplace, loadEquipmentsByWorkplace, loadWorkplaceWorkers]);

  // Reload plans when dependencies change (week or workplace)
  useEffect(() => {
    loadWeeklyPlans();
  }, [loadWeeklyPlans]);

  const toggleEquipment = (equipmentCode: string) => {
    const newExpanded = new Set(expandedEquipments);
    if (newExpanded.has(equipmentCode)) {
      newExpanded.delete(equipmentCode);
    } else {
      newExpanded.add(equipmentCode);
    }
    setExpandedEquipments(newExpanded);
  };

  const toggleDayVisibility = (dayIndex: number) => {
    const newVisibleDays = [...visibleDays];
    newVisibleDays[dayIndex] = !newVisibleDays[dayIndex];
    setVisibleDays(newVisibleDays);
    saveFilterToStorage(newVisibleDays);
  };

  const toggleAllDays = (visible: boolean) => {
    const newVisibleDays = visibleDays.map(() => visible);
    setVisibleDays(newVisibleDays);
    saveFilterToStorage(newVisibleDays);
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

  const handleOpenCreateDialog = (date: string, equipmentCode?: string) => {
    if (!selectedWorkplace) {
      showSnackbar('먼저 작업장을 선택해주세요.', 'error');
      return;
    }

    setDialogMode('create');
    setSelectedDate(date);
    setFormData({
      date,
      itemCode: '',
      itemName: '',
      plannedQty: 0,
      equipmentCode: equipmentCode || '',
      equipmentName:
        equipments.find((e) => e.equipCd === equipmentCode)?.equipmentName ||
        '',
      shift: 'DAY',
      remark: '',
      workplaceCode: selectedWorkplace,
      workplaceName:
        workplaces.find((w) => w.workplaceCode === selectedWorkplace)
          ?.workplaceName || '',
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

  const handleBatchChange = (updates: Partial<ProductionPlanData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleSearchChange = (field: string, value: string) => {
    setSearchValues({ ...searchValues, [field]: value });
  };

  const handleSearch = () => {
    showSnackbar('검색 기능은 백엔드 연동 후 구현됩니다.', 'success');
  };

  const handleSave = async (data: ProductionPlanData) => {
    if (dialogMode === 'create') {
      try {
        const requestData: ProductionPlanRequest = {
          master: {
            planDate: data.date.replace(/-/g, ''), // Ensure YYYYMMDD
            workplaceCode: selectedWorkplace,
            workplaceName: workplaces.find(
              (w) => w.workplaceCode === selectedWorkplace
            )?.workplaceName,
            remark: data.remark,
          },
          details: [
            {
              planDate: data.date.replace(/-/g, ''),
              itemCode: data.itemCode,
              itemName: data.itemName,
              plannedQty: data.plannedQty,
              equipmentCode: data.equipmentCode,
              equipmentName: data.equipmentName,
              shift: data.shift,
              remark: data.remark,
              orderNo: data.orderNo,
              orderSeqno: data.orderSeqno,
              orderHistno: data.orderHistno,
              workerCode: data.workerCode,
              workerName: data.workerName,
              customerCode: data.customerCode,
              customerName: data.customerName,
            },
          ],
        };

        const response = await productionPlanService.createProductionPlan(
          requestData
        );
        if (response.resultCode === 200) {
          showSnackbar('생산계획이 등록되었습니다.', 'success');
          loadWeeklyPlans(); // Reload plans
          handleCloseDialog();
        } else {
          showSnackbar('생산계획 등록 실패: ' + response.message, 'error');
        }
      } catch (error) {
        console.error('Failed to save plan:', error);
        showSnackbar('생산계획 등록 중 오류가 발생했습니다.', 'error');
      }
    } else {
      // Edit logic (Not fully implemented in backend for single item update via this specific API structure yet,
      // but assuming similar structure or separate update endpoint)
      // For now, let's focus on Registration as per requirement.
      // If edit is needed, we need planNo.
      showSnackbar('수정 기능은 아직 구현되지 않았습니다.', 'error');
      handleCloseDialog();
    }
  };

  const handleDelete = (planId: string) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      setPlans(plans.filter((p) => p.id !== planId));
      showSnackbar('생산계획이 삭제되었습니다.', 'success');
    }
  };

  const getPlansForDateAndEquipment = (date: string, equipmentCode: string) => {
    return plans.filter(
      (p) => p.date === date && p.equipmentCode === equipmentCode
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
            mb: 2,
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
            <Tooltip title="요일 표시 설정">
              <IconButton
                onClick={() => setShowDayFilter(!showDayFilter)}
                sx={{
                  bgcolor: showDayFilter ? 'warning.main' : 'grey.100',
                  color: showDayFilter ? 'white' : 'text.secondary',
                  '&:hover': {
                    bgcolor: showDayFilter ? 'warning.dark' : 'grey.200',
                  },
                }}
              >
                <VisibilityIcon />
              </IconButton>
            </Tooltip>
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
                onClick={() => {
                  loadWorkplaces();
                  if (selectedWorkplace) {
                    loadEquipmentsByWorkplace(selectedWorkplace);
                  }
                }}
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

        {/* 작업장 선택 영역 */}
        <Box sx={{ mt: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>작업장 선택 *</InputLabel>
            <Select
              value={selectedWorkplace}
              onChange={(e) => setSelectedWorkplace(e.target.value)}
              label="작업장 선택 *"
              required
            >
              <MenuItem value="">
                <em>작업장을 선택하세요</em>
              </MenuItem>
              {workplaces.map((workplace) => (
                <MenuItem
                  key={workplace.workplaceCode}
                  value={workplace.workplaceCode}
                >
                  {workplace.workplaceName} ({workplace.workplaceCode})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {!selectedWorkplace && (
            <Typography
              variant="caption"
              color="error"
              sx={{ mt: 0.5, display: 'block' }}
            >
              생산계획을 등록하려면 먼저 작업장을 선택해주세요.
            </Typography>
          )}
        </Box>
      </Paper>

      {/* 요일 표시 설정 패널 */}
      <Collapse in={showDayFilter}>
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
              <VisibilityIcon color="warning" />
              요일 표시 설정
            </Typography>
            <Stack
              direction="row"
              spacing={3}
              alignItems="center"
              flexWrap="wrap"
            >
              <FormGroup row>
                {['월', '화', '수', '목', '금', '토', '일'].map(
                  (day, index) => (
                    <FormControlLabel
                      key={day}
                      control={
                        <Checkbox
                          checked={visibleDays[index]}
                          onChange={() => toggleDayVisibility(index)}
                          color="primary"
                        />
                      }
                      label={`${day}요일`}
                    />
                  )
                )}
              </FormGroup>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    const default3Days = getDefault3DaysFilter();
                    setVisibleDays(default3Days);
                    saveFilterToStorage(default3Days);
                  }}
                  color="info"
                >
                  기본 3일
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => toggleAllDays(true)}
                >
                  전체 표시
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => toggleAllDays(false)}
                >
                  전체 숨김
                </Button>
              </Box>
            </Stack>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 1.5, display: 'block' }}
            >
              💡 선택한 요일 설정은 자동으로 저장되며, 다음날이 되면 기본
              3일(어제, 오늘, 내일)로 자동 초기화됩니다.
            </Typography>
          </CardContent>
        </Card>
      </Collapse>

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
                label="설비"
                value={searchValues.equipmentCode}
                onChange={(e) =>
                  handleSearchChange('equipmentCode', e.target.value)
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
                    width: 250,
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
                {weekDays.map((day, dayIndex) => {
                  if (!visibleDays[dayIndex]) return null;

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
              {equipments.length === 0 ? (
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
                equipments.map((equipment, index) => {
                  const isExpanded = expandedEquipments.has(equipment.equipCd);
                  return (
                    <React.Fragment key={equipment.equipCd}>
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
                          onClick={() => toggleEquipment(equipment.equipCd)}
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
                                {equipment.equipmentName}
                              </Typography>
                              <Chip
                                label={equipment.equipCd}
                                size="small"
                                sx={{ mt: 0.5 }}
                              />
                            </Box>
                          </Box>
                        </TableCell>
                        {weekDays.map((day, dayIndex) => {
                          if (!visibleDays[dayIndex]) return null;

                          const dateStr = formatDate(day, 'YYYY-MM-DD');
                          const dayPlans = getPlansForDateAndEquipment(
                            dateStr,
                            equipment.equipCd
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
                                        equipment.equipCd
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
                                              {plan.orderNo && (
                                                <Chip
                                                  label={`의뢰: ${plan.orderNo}`}
                                                  size="small"
                                                  sx={{ mt: 0.5 }}
                                                  color="info"
                                                  variant="outlined"
                                                />
                                              )}
                                              {/* 거래처 정보 표시 */}
                                              {plan.customerName && (
                                                <Box sx={{ mt: 0.5 }}>
                                                  <Chip
                                                    label={
                                                      plan.additionalCustomers &&
                                                      plan.additionalCustomers
                                                        .length > 0
                                                        ? `${plan.customerName} 외 ${plan.additionalCustomers.length}건`
                                                        : plan.customerName
                                                    }
                                                    size="small"
                                                    color="secondary"
                                                    variant="outlined"
                                                    sx={{
                                                      cursor: plan
                                                        .additionalCustomers
                                                        ?.length
                                                        ? 'pointer'
                                                        : 'default',
                                                    }}
                                                    onClick={() => {
                                                      if (
                                                        plan.additionalCustomers &&
                                                        plan.additionalCustomers
                                                          .length > 0
                                                      ) {
                                                        alert(
                                                          `거래처 목록:\n- ${
                                                            plan.customerName
                                                          }\n- ${plan.additionalCustomers.join(
                                                            '\n- '
                                                          )}`
                                                        );
                                                      }
                                                    }}
                                                  />
                                                </Box>
                                              )}
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
      <PlanDialog
        open={openDialog}
        onClose={handleCloseDialog}
        dialogMode={dialogMode}
        selectedDate={selectedDate}
        formData={formData}
        equipments={equipments}
        workplaceWorkers={workplaceWorkers}
        onSave={handleSave}
        onChange={handleChange}
        onBatchChange={handleBatchChange}
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
