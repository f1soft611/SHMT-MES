import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
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
  ViewCompact as ViewCompactIcon,
  CameraAlt as CameraAltIcon,
} from '@mui/icons-material';
import equipmentService from '../../services/equipmentService';
import workplaceService from '../../services/workplaceService';
import productionPlanService, {
  ProductionPlanRequest,
} from '../../services/productionPlanService';
import { Equipment } from '../../types/equipment';
import { Workplace, WorkplaceWorker } from '../../types/workplace';
import { ProductionPlanData } from '../../types/productionPlan';
import {
  mapWeeklyEquipmentPlans,
  WeeklyEquipmentPlanResponse,
} from '../../utils/productionPlanMapper';
import PlanDialog from './components/PlanDialog';
import { useToast } from '../../components/common/Feedback/ToastProvider';
import ConfirmDialog from '../../components/common/Feedback/ConfirmDialog';
import html2canvas from 'html2canvas';

// localStorage 키 상수
const STORAGE_KEY_DAY_FILTER = 'productionPlan_visibleDays';
const STORAGE_KEY_LAST_DATE = 'productionPlan_lastAccessDate';

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

  // 근무구분 표시 헬퍼 함수
  const getShiftLabel = (shift?: string): string => {
    const shiftMap: { [key: string]: string } = {
      A: '1교대',
      B: '2교대',
      C: '3교대',
      D: '주간',
      N: '야간',
      DAY: '주간',
      NIGHT: '야간',
    };
    return shift ? shiftMap[shift] || shift : '-';
  };

  const getShiftColor = (
    shift?: string
  ):
    | 'default'
    | 'primary'
    | 'secondary'
    | 'error'
    | 'info'
    | 'success'
    | 'warning' => {
    const colorMap: {
      [key: string]:
        | 'default'
        | 'primary'
        | 'secondary'
        | 'error'
        | 'info'
        | 'success'
        | 'warning';
    } = {
      A: 'primary', // 1교대 - 파랑
      B: 'success', // 2교대 - 초록
      C: 'info', // 3교대 - 하늘
      D: 'warning', // 주간 - 주황
      N: 'secondary', // 야간 - 보라
      DAY: 'warning',
      NIGHT: 'secondary',
    };
    return shift ? colorMap[shift] || 'default' : 'default';
  };

  const getShiftBorderColor = (shift?: string): string => {
    const borderColorMap: { [key: string]: string } = {
      A: 'primary.main', // 1교대
      B: 'success.main', // 2교대
      C: 'info.main', // 3교대
      D: 'warning.main', // 주간
      N: 'secondary.main', // 야간
      DAY: 'warning.main',
      NIGHT: 'secondary.main',
    };
    return shift ? borderColorMap[shift] || 'grey.400' : 'grey.400';
  };

  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(
    getMonday(new Date())
  );

  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [confirmDelete, setConfirmDelete] = useState<{
    open: boolean;
    plan?: ProductionPlanData;
  }>({ open: false });
  const { showToast } = useToast();

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
  // const [workplaceProcesses, setWorkplaceProcesses] = useState<any[]>([]);
  const [equipmentProcessMap, setEquipmentProcessMap] = useState<
    Map<string, string>
  >(new Map());
  const [expandedEquipments, setExpandedEquipments] = useState<Set<string>>(
    new Set()
  );
  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const [compactMode, setCompactMode] = useState(true);
  const weeklyGridRef = useRef<HTMLDivElement>(null);

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

  // const loadWorkplaceProcesses = useCallback(async (workplaceCode: string) => {
  //   try {
  //     const response = await workplaceService.getWorkplaceProcesses(
  //       workplaceCode
  //     );
  //     if (response.resultCode === 200 && response.result?.resultList) {
  //       setWorkplaceProcesses(response.result.resultList);
  //     }
  //   } catch (error) {
  //     console.error('Failed to load workplace processes:', error);
  //     setWorkplaceProcesses([]);
  //   }
  // }, []);

  const loadWeeklyPlans = useCallback(async () => {
    if (!selectedWorkplace) return;

    const weekStart = currentWeekStart;
    const weekEnd = addDays(currentWeekStart, 6);

    try {
      const response = await productionPlanService.getWeeklyProductionPlans({
        workplaceCode: selectedWorkplace,
        startDate: formatDate(weekStart, 'YYYYMMDD'),
        endDate: formatDate(weekEnd, 'YYYYMMDD'),
      });

      if (response.resultCode === 200 && response.result?.equipmentPlans) {
        // API 응답에서 설비 목록 추출
        const equipmentList = response.result.equipmentPlans.map((eq: any) => ({
          equipCd: eq.equipmentCode,
          equipmentName: eq.equipmentName,
          equipmentId: eq.equipmentId,
          processCode: eq.processCode,
          processName: eq.processName,
        }));
        setEquipments(equipmentList);
        setExpandedEquipments(
          new Set(equipmentList.map((eq: any) => eq.equipCd))
        );

        // 설비-공정 매핑 생성
        const processMap = new Map<string, string>();
        equipmentList.forEach((eq: any) => {
          if (eq.equipCd && eq.processCode) {
            processMap.set(eq.equipCd, eq.processCode);
            processMap.set(eq.equipCd + 'NAME', eq.processName || '');
          }
        });
        setEquipmentProcessMap(processMap);

        // 주간 계획 매핑
        const mapped = mapWeeklyEquipmentPlans(
          response.result as WeeklyEquipmentPlanResponse,
          selectedWorkplace
        );
        setPlans(mapped);
      } else {
        setEquipments([]);
        setPlans([]);
        setExpandedEquipments(new Set());
        setEquipmentProcessMap(new Map());
      }
    } catch (error) {
      console.error('Failed to load production plans:', error);
      showToast({
        message: '생산계획 조회에 실패했습니다.',
        severity: 'error',
      });
    }
  }, [currentWeekStart, selectedWorkplace, showToast]);

  useEffect(() => {
    loadWorkplaces();
    // 날짜 변경 체크는 컴포넌트 마운트 시 loadVisibleDaysFromStorage()에서 자동으로 수행됨
  }, [loadWorkplaces]);

  useEffect(() => {
    if (selectedWorkplace) {
      // loadWeeklyPlans()가 자동으로 설비 목록을 로드하므로 별도 호출 불필요
      loadWorkplaceWorkers(selectedWorkplace);
      // loadWorkplaceProcesses(selectedWorkplace);
    } else {
      setEquipments([]);
      setWorkplaceWorkers([]);
      // setWorkplaceProcesses([]);
      setEquipmentProcessMap(new Map());
      setPlans([]);
      setExpandedEquipments(new Set());
    }
  }, [
    selectedWorkplace,
    loadWorkplaceWorkers,
    // loadWorkplaceProcesses,
  ]);

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
    const default3Days = getDefault3DaysFilter();
    setVisibleDays(default3Days);
    saveFilterToStorage(default3Days);
    setCurrentWeekStart(getMonday(new Date()));
  };

  const handleCapture = async () => {
    if (!weeklyGridRef.current) return;

    try {
      const canvas = await html2canvas(weeklyGridRef.current, {
        logging: false,
      } as any);

      // 캡쳐된 이미지를 다운로드
      const link = document.createElement('a');
      const weekStart = formatDate(currentWeekStart, 'YYYY-MM-DD');
      const weekEnd = formatDate(addDays(currentWeekStart, 6), 'YYYY-MM-DD');
      link.download = `생산계획_${weekStart}~${weekEnd}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      showToast({
        message: '주간 달력이 캡쳐되었습니다.',
        severity: 'success',
      });
    } catch (error) {
      console.error('캡쳐 실패:', error);
      showToast({
        message: '캡쳐에 실패했습니다.',
        severity: 'error',
      });
    }
  };

  const handleOpenCreateDialog = (date: string, equipmentCode?: string) => {
    if (!selectedWorkplace) {
      showToast({
        message: '먼저 작업장을 선택해주세요.',
        severity: 'error',
      });
      return;
    }

    // 설비에 매핑된 공정코드 찾기
    const processCode = equipmentCode
      ? equipmentProcessMap.get(equipmentCode) || ''
      : '';
    const processName = equipmentCode
      ? equipmentProcessMap.get(equipmentCode + 'NAME') || ''
      : '';

    setDialogMode('create');
    setSelectedDate(date);
    setFormData({
      date,
      itemCode: '',
      itemName: '',
      plannedQty: 0,
      equipmentId:
        equipments.find((e) => e.equipCd === equipmentCode)?.equipmentId || '',
      equipmentCode: equipmentCode || '',
      equipmentName:
        equipments.find((e) => e.equipCd === equipmentCode)?.equipmentName ||
        '',
      shift: '',
      remark: '',
      workplaceCode: selectedWorkplace,
      workplaceName:
        workplaces.find((w) => w.workplaceCode === selectedWorkplace)
          ?.workplaceName || '',
      processCode: processCode,
      processName: processName,
    });
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (plan: ProductionPlanData) => {
    // 공정 정보가 없으면 설비 코드로부터 찾기
    let processCode = plan.processCode || '';
    let processName = plan.processName || '';

    if (!processCode && plan.equipmentCode) {
      processCode = equipmentProcessMap.get(plan.equipmentCode) || '';
      processName = equipmentProcessMap.get(plan.equipmentCode + 'NAME') || '';
    }

    setDialogMode('edit');
    // 수정 모드에서는 작업장과 공정 정보를 포함하여 전달
    setFormData({
      ...plan,
      workplaceCode: plan.workplaceCode || selectedWorkplace,
      workplaceName:
        plan.workplaceName ||
        workplaces.find((w) => w.workplaceCode === selectedWorkplace)
          ?.workplaceName ||
        '',
      processCode: processCode,
      processName: processName,
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // 넓은 시그니처 허용 (JSX 전달 시 string|number|symbol 형태 요구되는 경우 대응)
  const handleChange = (
    field: keyof ProductionPlanData | string | number | symbol,
    value: any
  ) => {
    setFormData({
      ...formData,
      [field as keyof ProductionPlanData]: value,
    });
  };

  const handleBatchChange = (updates: Partial<ProductionPlanData>) => {
    setFormData((prev: ProductionPlanData) => ({ ...prev, ...updates }));
  };

  const handleSearchChange = (field: string, value: string) => {
    setSearchValues({ ...searchValues, [field]: value });
  };

  const handleSearch = () => {
    showToast({
      message: '검색 기능은 백엔드 연동 후 구현됩니다.',
      severity: 'success',
    });
  };

  const handleSave = async (data: ProductionPlanData, references?: any[]) => {
    console.log('handleSave called');
    console.log('dialogMode:', dialogMode);
    console.log('data:', data);
    console.log('formData:', formData);

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
              workplaceCode: selectedWorkplace,
              workplaceName: workplaces.find(
                (w) => w.workplaceCode === selectedWorkplace
              )?.workplaceName,
              processCode: data.processCode,
              processName: data.processName,
              equipmentId: data.equipmentId,
              equipmentCode: data.equipmentCode,
              equipmentName: data.equipmentName,
              workerType: data.shift,
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
          references: references || [],
        };

        const response = await productionPlanService.createProductionPlan(
          requestData
        );
        if (response.resultCode === 200) {
          showToast({
            message: '생산계획이 등록되었습니다.',
            severity: 'success',
          });
          loadWeeklyPlans(); // Reload plans
          handleCloseDialog();
        } else {
          showToast({
            message: '생산계획 등록 실패: ' + response.message,
            severity: 'error',
          });
        }
      } catch (error) {
        console.error('Failed to save plan:', error);
        showToast({
          message: '생산계획 등록 중 오류가 발생했습니다.',
          severity: 'error',
        });
      }
    } else {
      // Edit mode - 수정
      try {
        if (!formData.planNo) {
          showToast({
            message: '수정할 계획 정보가 없습니다.',
            severity: 'error',
          });
          return;
        }

        const requestData: ProductionPlanRequest = {
          master: {
            planNo: formData.planNo,
            planDate: data.date.replace(/-/g, ''),
            workplaceCode: formData.workplaceCode || selectedWorkplace,
            workplaceName:
              formData.workplaceName ||
              workplaces.find((w) => w.workplaceCode === selectedWorkplace)
                ?.workplaceName,
            remark: data.remark,
          },
          details: [
            {
              planNo: formData.planNo,
              planSeq: formData.planSeq,
              planDate: data.date.replace(/-/g, ''),
              itemCode: data.itemCode,
              itemName: data.itemName,
              plannedQty: data.plannedQty,
              workplaceCode: formData.workplaceCode || selectedWorkplace,
              workplaceName: formData.workplaceName,
              processCode: data.processCode,
              processName: data.processName,
              equipmentId: data.equipmentId,
              equipmentCode: data.equipmentCode,
              equipmentName: data.equipmentName,
              workerType: data.shift,
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

        const response = await productionPlanService.updateProductionPlan(
          formData.planNo,
          requestData
        );
        if (response.resultCode === 200) {
          showToast({
            message: '생산계획이 수정되었습니다.',
            severity: 'success',
          });
          loadWeeklyPlans();
          handleCloseDialog();
        } else {
          showToast({
            message: '생산계획 수정 실패: ' + response.message,
            severity: 'error',
          });
        }
      } catch (error) {
        console.error('Failed to update plan:', error);
        showToast({
          message: '생산계획 수정 중 오류가 발생했습니다.',
          severity: 'error',
        });
      }
    }
  };

  const handleDelete = async (plan: ProductionPlanData) => {
    if (!plan.planNo) {
      showToast({
        message: '삭제할 계획 정보가 없습니다.',
        severity: 'error',
      });
      return;
    }

    setConfirmDelete({ open: true, plan });
  };

  const executeDelete = async () => {
    if (!confirmDelete.plan || !confirmDelete.plan.planNo) return;

    try {
      const response = await productionPlanService.deleteProductionPlan(
        confirmDelete.plan.planNo
      );
      if (response.resultCode === 200) {
        showToast({
          message: '생산계획이 삭제되었습니다.',
          severity: 'success',
        });
        loadWeeklyPlans();
      } else {
        showToast({
          message: '생산계획 삭제 실패: ' + response.message,
          severity: 'error',
        });
      }
    } catch (error) {
      console.error('Failed to delete plan:', error);
      showToast({
        message: '생산계획 삭제 중 오류가 발생했습니다.',
        severity: 'error',
      });
    } finally {
      setConfirmDelete({ open: false });
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

  const equipmentColWidth = compactMode ? 200 : 250;
  const dayColMinWidth = compactMode ? 140 : 180;
  const cardPadding = compactMode ? 1 : 1.5;
  const cellPadding = compactMode ? 1 : 1.5;
  const sectionGap = compactMode ? 1.5 : 2;
  const headerTitleVariant: 'h4' | 'h5' = compactMode ? 'h5' : 'h4';
  const headerPad = compactMode ? 2 : 3;

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
          p: headerPad,
          mb: sectionGap,
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
            mb: compactMode ? 1.5 : 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                p: compactMode ? 1 : 1.5,
                bgcolor: 'primary.main',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ViewWeekIcon
                sx={{ fontSize: compactMode ? 28 : 32, color: 'white' }}
              />
            </Box>
            <Stack
              direction="row"
              spacing={compactMode ? 1 : 1.25}
              alignItems="center"
              flexWrap="nowrap"
              sx={{ whiteSpace: 'nowrap', minWidth: 0 }}
            >
              <Typography
                variant={headerTitleVariant}
                sx={{ color: 'text.primary', fontWeight: 700 }}
              >
                생산계획 수립
              </Typography>
              <Typography
                variant={compactMode ? 'body2' : 'body1'}
                sx={{ color: 'text.secondary', fontWeight: 500 }}
              >
                · 주간 일정 관리
              </Typography>
            </Stack>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title={compactMode ? '기본 모드' : 'Compact 모드'}>
              <IconButton
                onClick={() => setCompactMode((prev) => !prev)}
                sx={{
                  bgcolor: compactMode ? 'primary.main' : 'grey.100',
                  color: compactMode ? 'white' : 'text.secondary',
                  '&:hover': {
                    bgcolor: compactMode ? 'primary.dark' : 'grey.200',
                  },
                }}
              >
                <ViewCompactIcon />
              </IconButton>
            </Tooltip>
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
                    loadWeeklyPlans();
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
        <Card sx={{ mb: sectionGap, boxShadow: 2 }}>
          <CardContent sx={{ p: compactMode ? 1.5 : 2 }}>
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
              spacing={compactMode ? 2 : 3}
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
              sx={{ mt: compactMode ? 1 : 1.5, display: 'block' }}
            >
              💡 선택한 요일 설정은 자동으로 저장되며, 다음날이 되면 기본
              3일(어제, 오늘, 내일)로 자동 초기화됩니다.
            </Typography>
          </CardContent>
        </Card>
      </Collapse>

      {/* 검색 영역 */}
      <Collapse in={showSearchPanel}>
        <Card sx={{ mb: sectionGap, boxShadow: 2 }}>
          <CardContent sx={{ p: compactMode ? 1.5 : 2 }}>
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
              spacing={compactMode ? 1.5 : 2}
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
                size={compactMode ? 'small' : 'medium'}
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
      <Card sx={{ mb: sectionGap, boxShadow: 2 }}>
        <CardContent sx={{ p: compactMode ? 1.5 : 2 }}>
          <Stack
            direction="row"
            spacing={compactMode ? 1.5 : 2}
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

            <Box
              sx={{ textAlign: 'center', minWidth: compactMode ? 260 : 350 }}
            >
              <Typography
                variant={compactMode ? 'h6' : 'h5'}
                sx={{ fontWeight: 700, color: 'primary.main' }}
              >
                {formatDate(currentWeekStart, 'YYYY년 MM월 DD일')} ~{' '}
                {formatDate(addDays(currentWeekStart, 6), 'MM월 DD일')}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 0.25 }}
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

            <Button
              variant="contained"
              color="primary"
              startIcon={<CameraAltIcon />}
              onClick={handleCapture}
            >
              캡쳐
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* 주간 그리드 */}
      <Paper
        ref={weeklyGridRef}
        sx={{ flex: 1, overflow: 'hidden', boxShadow: 2 }}
      >
        <TableContainer sx={{ height: '100%', overflowX: 'auto' }}>
          <Table stickyHeader size={compactMode ? 'small' : 'medium'}>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    position: 'sticky',
                    left: 0,
                    zIndex: 3,
                    width: equipmentColWidth,
                    bgcolor: 'primary.main',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: compactMode ? '0.95rem' : '1rem',
                    borderRight: '1px solid rgba(224, 224, 224, 1)',
                    p: compactMode ? 1 : 1.5,
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
                        minWidth: dayColMinWidth,
                        bgcolor: isToday
                          ? 'warning.main'
                          : isWeekendDay
                          ? 'grey.400'
                          : 'primary.main',
                        color: 'white',
                        fontWeight: 'bold',
                        borderRight: '1px solid rgba(224, 224, 224, 1)',
                        p: compactMode ? 1 : 1.25,
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: compactMode ? 1 : 1.25,
                          flexWrap: 'nowrap',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <Typography variant="caption" sx={{ opacity: 0.9 }}>
                          {formatDate(day, 'ddd')}요일
                        </Typography>
                        <Typography
                          variant={compactMode ? 'subtitle1' : 'h6'}
                          sx={{ fontWeight: 700, lineHeight: 1.1 }}
                        >
                          {formatDate(day, 'MM/DD')}
                        </Typography>
                        {totalPlans > 0 && (
                          <Chip
                            label={`${totalPlans}건`}
                            size="small"
                            color="error"
                            sx={{
                              bgcolor: 'rgba(255,255,255,0.9)',
                              color: 'error.main',
                              fontWeight: 600,
                            }}
                          />
                        )}
                        {totalPlans > 0 && (
                          <Chip
                            label={`${(totalQty ?? 0).toLocaleString()} 개`}
                            size="small"
                            sx={{
                              bgcolor: 'rgba(255,255,255,0.9)',
                              color: 'primary.main',
                              fontWeight: 'bold',
                            }}
                          />
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
                            position: 'sticky',
                            left: 0,
                            zIndex: 2,
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            borderRight: '1px solid',
                            borderColor: 'divider',
                            bgcolor: index % 2 === 0 ? 'white' : 'grey.50',
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
                                p: cellPadding,
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
                                    sx={{ mb: compactMode ? 1 : 1.5 }}
                                  >
                                    계획 추가
                                  </Button>

                                  <Stack spacing={compactMode ? 1 : 1.5}>
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
                                          borderColor: getShiftBorderColor(
                                            plan.shift
                                          ),
                                        }}
                                      >
                                        <CardContent
                                          sx={{
                                            p: cardPadding,
                                            '&:last-child': { pb: cardPadding },
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
                                              {/* 1줄: 품목코드, 품목명 */}
                                              <Box
                                                sx={{
                                                  display: 'flex',
                                                  alignItems: 'center',
                                                  gap: 0.5,
                                                  flexWrap: 'wrap',
                                                }}
                                              >
                                                <Chip
                                                  label={
                                                    plan.itemDisplayCode ||
                                                    plan.itemCode
                                                  }
                                                  size="small"
                                                  color="primary"
                                                  variant="outlined"
                                                />
                                                <Typography
                                                  variant="body2"
                                                  sx={{
                                                    fontWeight: 600,
                                                    color: 'text.primary',
                                                  }}
                                                >
                                                  {plan.itemName}
                                                </Typography>
                                              </Box>

                                              {/* 2줄: 수량, 담당자, 근무구분, 거래처 */}
                                              <Box
                                                sx={{
                                                  display: 'flex',
                                                  gap: 0.5,
                                                  mt: 0.5,
                                                  flexWrap: 'wrap',
                                                  alignItems: 'center',
                                                }}
                                              >
                                                <Chip
                                                  label={`${(
                                                    plan.plannedQty ?? 0
                                                  ).toLocaleString()}`}
                                                  size="small"
                                                  color="error"
                                                  sx={{
                                                    fontWeight: 600,
                                                  }}
                                                />
                                                {plan.workerName && (
                                                  <Chip
                                                    label={plan.workerName}
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{
                                                      borderColor:
                                                        'primary.main',
                                                      color: 'primary.main',
                                                    }}
                                                  />
                                                )}
                                                <Chip
                                                  label={getShiftLabel(
                                                    plan.shift
                                                  )}
                                                  size="small"
                                                  color={getShiftColor(
                                                    plan.shift
                                                  )}
                                                />
                                                {plan.customerName && (
                                                  <Chip
                                                    label={
                                                      plan.additionalCustomers &&
                                                      plan.additionalCustomers
                                                        .length > 0
                                                        ? `${plan.customerName} 외${plan.additionalCustomers.length}`
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
                                                )}
                                                {plan.orderNo && (
                                                  <Chip
                                                    label={`의뢰:${plan.orderNo}`}
                                                    size="small"
                                                    color="info"
                                                    variant="outlined"
                                                  />
                                                )}
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
                                                    handleDelete(plan)
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
        workplaceCode={selectedWorkplace}
        onSave={handleSave}
        onChange={handleChange}
        onBatchChange={handleBatchChange}
      />

      {/* 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false })}
        title="생산계획 삭제"
        message="선택한 생산계획을 삭제하시겠습니까?"
        confirmText="삭제"
        onConfirm={executeDelete}
      />
    </Box>
  );
};

export default ProductionPlan;
