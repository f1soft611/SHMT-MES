import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Collapse,
  IconButton,
  LinearProgress,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  ViewWeek as ViewWeekIcon,
} from '@mui/icons-material';
import { Equipment } from '../../../types/equipment';
import { ProductionPlanData } from '../../../types/productionPlan';
import { decodeHtml } from '../../../utils/stringUtils';

type GroupColor = { main: string; light: string; dark: string };
type ChipColor =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'error'
  | 'info'
  | 'success'
  | 'warning';

interface PlanCardProps {
  plan: ProductionPlanData;
  isGroupActive: boolean;
  groupColor: GroupColor | null;
  isGrouped: boolean;
  groupSeq: number;
  groupTotal: number;
  planDisplayCode: string;
  compactMode: boolean;
  cardPadding: number;
  getShiftLabel: (shift?: string) => string;
  getShiftColor: (shift?: string) => ChipColor;
  getShiftBorderColor: (shift?: string) => string;
  handleOpenEditDialog: (plan: ProductionPlanData) => void;
  handleDelete: (plan: ProductionPlanData) => void;
  onGroupClick: (groupId: string) => void;
}

const PlanCard = memo<PlanCardProps>(
  ({
    plan,
    isGroupActive,
    groupColor,
    isGrouped,
    groupSeq,
    groupTotal,
    planDisplayCode,
    compactMode,
    cardPadding,
    getShiftLabel,
    getShiftColor,
    getShiftBorderColor,
    handleOpenEditDialog,
    handleDelete,
    onGroupClick,
  }) => {
    return (
      <Card
        elevation={0}
        sx={{
          '&:hover': {
            transform: 'translateY(-2px)',
          },
          transition: 'all 0.3s ease',
          borderLeft: '4px solid',
          borderColor: groupColor?.main || getShiftBorderColor(plan.shift),
          position: 'relative',
          ...(isGroupActive && {
            border: '3px dashed',
            borderColor: groupColor?.main,
            transform: 'scale(1.01)',
          }),
        }}
      >
        <CardContent
          sx={{
            p: cardPadding,
            '&:last-child': {
              pb: cardPadding,
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
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  flexWrap: 'wrap',
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    fontSize: compactMode ? '0.85rem' : '1rem',
                    color: 'text.primary',
                  }}
                >
                  {decodeHtml(plan.itemName)}
                  {planDisplayCode && (
                    <Typography
                      component="span"
                      variant="body2"
                      sx={{
                        ml: 1,
                        color: 'primary.main',
                        fontSize: compactMode ? '0.8rem' : '0.95rem',
                        fontWeight: 500,
                      }}
                    >
                      ({planDisplayCode})
                    </Typography>
                  )}
                </Typography>

                {isGrouped && (
                  <Chip
                    label={`🔗 ${groupSeq}/${groupTotal}`}
                    size="small"
                    variant="outlined"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (plan.planGroupId) {
                        onGroupClick(plan.planGroupId);
                      }
                    }}
                    sx={{
                      borderColor: groupColor?.main,
                      color: groupColor?.dark,
                      ml: 0.5,
                      fontWeight: 700,
                      backgroundColor: isGroupActive
                        ? groupColor?.light
                        : 'white',
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: groupColor?.light,
                      },
                    }}
                  />
                )}
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  gap: 0.5,
                  mt: 0.25,
                  flexWrap: 'wrap',
                  alignItems: 'center',
                }}
              >
                <Chip
                  label={`${(plan.plannedQty ?? 0).toLocaleString()}`}
                  size="small"
                  color="error"
                  sx={{
                    fontWeight: 600,
                  }}
                />
                {!!plan.workerName?.trim() && (
                  <Chip
                    label={plan.workerName}
                    size="small"
                    variant="outlined"
                    sx={{
                      borderColor: 'primary.main',
                      color: 'primary.main',
                    }}
                  />
                )}
                {!!plan.shift?.trim() && (
                  <Chip
                    label={getShiftLabel(plan.shift)}
                    size="small"
                    color={getShiftColor(plan.shift)}
                  />
                )}
                {plan.orderFlag === 'ORDERED' && (
                  <Chip
                    label="지시완료"
                    size="small"
                    color="success"
                    sx={{
                      fontWeight: 600,
                      bgcolor: 'success.main',
                      color: 'white',
                    }}
                  />
                )}
                {plan.customerName && (
                  <Chip
                    label={
                      plan.additionalCustomers &&
                      plan.additionalCustomers.length > 0
                        ? `${plan.customerName} 외${plan.additionalCustomers.length}`
                        : plan.customerName
                    }
                    size="small"
                    color="secondary"
                    variant="outlined"
                    sx={{
                      maxWidth: '100%',
                      height: 'auto',
                      alignSelf: 'flex-start',
                      '& .MuiChip-label': {
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        display: 'block',
                      },
                      cursor: plan.additionalCustomers?.length
                        ? 'pointer'
                        : 'default',
                    }}
                    onClick={() => {
                      if (
                        plan.additionalCustomers &&
                        plan.additionalCustomers.length > 0
                      ) {
                        alert(
                          `거래처 목록:\n- ${plan.customerName}\n- ${plan.additionalCustomers.join('\n- ')}`,
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
                flexShrink: 0,
              }}
            >
              <Tooltip title="수정">
                <IconButton
                  size="small"
                  onClick={() => handleOpenEditDialog(plan)}
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
                  onClick={() => handleDelete(plan)}
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
    );
  },
);

interface WeeklyGridProps {
  weeklyGridRef: React.RefObject<HTMLDivElement | null>;
  compactMode: boolean;
  loading: boolean;
  equipments: Equipment[];
  weekDays: Date[];
  visibleDays: boolean[];
  expandedEquipments: Set<string>;
  activeGroupId: string | null;
  plans: ProductionPlanData[];
  formatDate: (date: Date, format: string) => string;
  isSameDay: (date1: Date, date2: Date) => boolean;
  isWeekend: (date: Date) => boolean;
  getServerDate: () => Date;
  getShiftLabel: (shift?: string) => string;
  getShiftColor: (
    shift?: string,
  ) =>
    | 'default'
    | 'primary'
    | 'secondary'
    | 'error'
    | 'info'
    | 'success'
    | 'warning';
  getShiftBorderColor: (shift?: string) => string;
  getTotalPlansForDate: (dateStr: string) => number;
  getTotalQtyForDate: (dateStr: string) => number;
  getPlansForDateAndEquipment: (
    dateStr: string,
    equipmentCode: string,
  ) => ProductionPlanData[];
  toggleEquipment: (equipmentCode: string) => void;
  handleOpenCreateDialog: (date: string, equipmentCode?: string) => void;
  handleOpenEditDialog: (plan: ProductionPlanData) => void;
  handleDelete: (plan: ProductionPlanData) => void;
  setActiveGroupId: (id: string | null) => void;
}

const WeeklyGrid: React.FC<WeeklyGridProps> = ({
  weeklyGridRef,
  compactMode,
  loading,
  equipments,
  weekDays,
  visibleDays,
  expandedEquipments,
  activeGroupId,
  plans,
  formatDate,
  isSameDay,
  isWeekend,
  getServerDate,
  getShiftLabel,
  getShiftColor,
  getShiftBorderColor,
  getTotalPlansForDate,
  getTotalQtyForDate,
  getPlansForDateAndEquipment,
  toggleEquipment,
  handleOpenCreateDialog,
  handleOpenEditDialog,
  handleDelete,
  setActiveGroupId,
}) => {
  const tableContainerRef = useRef<HTMLDivElement | null>(null);
  const [scrollWidth, setScrollWidth] = useState(0);
  const [clientWidth, setClientWidth] = useState(0);
  // 스타일 상수
  const equipmentColWidth = compactMode ? 180 : 240;
  const dayColMinWidth = compactMode ? 280 : 360;
  const emptyDayColWidth = compactMode ? 120 : 160;
  const cellPadding = compactMode ? 0.75 : 1;
  const cardPadding = compactMode ? 0.75 : 1;
  const visibleDayCount = visibleDays.filter(Boolean).length;
  const emptyColSpan = 1 + visibleDayCount;
  const isEmptyState = !loading && equipments.length === 0;
  const hasRenderedData = equipments.length > 0 || plans.length > 0;
  const showInitialSkeleton = loading && !hasRenderedData;
  const showRefreshingIndicator = loading && hasRenderedData;
  const canScrollHorizontally = scrollWidth > clientWidth + 1;

  const tableScrollbarSx = {
    '&::-webkit-scrollbar': {
      height: 10,
    },
    '&::-webkit-scrollbar-track': {
      backgroundColor: '#edf2f7',
      borderRadius: 999,
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: '#6f8fb7',
      borderRadius: 999,
      border: '2px solid #edf2f7',
      minWidth: 40,
    },
    '&::-webkit-scrollbar-thumb:hover': {
      backgroundColor: '#4b709e',
    },
    '&::-webkit-scrollbar-thumb:active': {
      backgroundColor: '#365985',
    },
    scrollbarColor: '#6f8fb7 #edf2f7',
    scrollbarWidth: 'thin',
  };

  const visibleDayColumns = useMemo(() => {
    return weekDays.flatMap((day, dayIndex) => {
      if (!visibleDays[dayIndex]) {
        return [];
      }

      const dateStr = formatDate(day, 'YYYY-MM-DD');
      const totalPlans = getTotalPlansForDate(dateStr);
      const totalQty = getTotalQtyForDate(dateStr);

      return [
        {
          date: day,
          dateStr,
          isToday: isSameDay(day, getServerDate()),
          isWeekendDay: isWeekend(day),
          totalPlans,
          totalQty,
          dayColWidth: totalPlans > 0 ? dayColMinWidth : emptyDayColWidth,
        },
      ];
    });
  }, [
    dayColMinWidth,
    emptyDayColWidth,
    formatDate,
    getServerDate,
    getTotalPlansForDate,
    getTotalQtyForDate,
    isSameDay,
    isWeekend,
    visibleDays,
    weekDays,
  ]);

  useEffect(() => {
    const container = tableContainerRef.current;
    if (!container) return;

    const updateSizes = () => {
      setScrollWidth(container.scrollWidth);
      setClientWidth(container.clientWidth);
    };

    updateSizes();
    const resizeObserver = new ResizeObserver(updateSizes);
    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [weekDays, equipments, loading, compactMode, visibleDays]);

  const handleTableWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    const container = tableContainerRef.current;
    if (!container) {
      return;
    }

    const useHorizontalScroll =
      event.shiftKey || Math.abs(event.deltaX) > Math.abs(event.deltaY);

    if (!useHorizontalScroll) {
      return;
    }

    const horizontalDelta = event.deltaX || event.deltaY;

    if (horizontalDelta === 0) {
      return;
    }

    const maxScrollLeft = container.scrollWidth - container.clientWidth;
    if (maxScrollLeft <= 0) {
      return;
    }

    const nextLeft = Math.max(
      0,
      Math.min(maxScrollLeft, container.scrollLeft + horizontalDelta),
    );

    if (nextLeft !== container.scrollLeft) {
      container.scrollLeft = nextLeft;
      event.preventDefault();
    }
  };

  const scrollButtonSx = {
    border: '1px solid',
    borderColor: canScrollHorizontally ? 'rgba(25, 118, 210, 0.24)' : 'divider',
    bgcolor: canScrollHorizontally ? '#f6f9fe' : 'grey.100',
    color: canScrollHorizontally ? 'primary.main' : 'text.secondary',
    flexShrink: 0,
    boxShadow: canScrollHorizontally
      ? '0 3px 8px rgba(19, 63, 117, 0.1)'
      : 'none',
    transition:
      'background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
    '&:hover': {
      bgcolor: canScrollHorizontally ? '#ebf2fb' : 'grey.200',
      borderColor: canScrollHorizontally ? 'primary.main' : 'divider',
      boxShadow: canScrollHorizontally
        ? '0 5px 12px rgba(19, 63, 117, 0.16)'
        : 'none',
    },
  };

  const scrollByAmount = (direction: 'left' | 'right') => {
    const container = tableContainerRef.current;
    if (!container) return;

    const headerCell = container.querySelector(
      'th[data-day-col="true"]',
    ) as HTMLElement | null;
    const dayWidth = headerCell?.offsetWidth || dayColMinWidth;
    const delta = direction === 'left' ? -dayWidth : dayWidth;
    const maxScrollLeft = Math.max(
      0,
      container.scrollWidth - container.clientWidth,
    );
    const nextLeft = Math.max(
      0,
      Math.min(maxScrollLeft, container.scrollLeft + delta),
    );

    if (nextLeft !== container.scrollLeft) {
      container.scrollTo({ left: nextLeft, behavior: 'smooth' });
    }
  };

  // 그룹별 고유 색상 생성 (planGroupId 기반)
  const getGroupColor = (groupId: string) => {
    const colors = [
      {
        main: '#1976d2',
        light: '#E3F2FD',
        dark: '#1565c0',
      },
      {
        main: '#9c27b0',
        light: '#F3E5F5',
        dark: '#7b1fa2',
      },
      {
        main: '#f57c00',
        light: '#FFF3E0',
        dark: '#e65100',
      },
      {
        main: '#00897b',
        light: '#E0F2F1',
        dark: '#00695c',
      },
      {
        main: '#d32f2f',
        light: '#FFEBEE',
        dark: '#c62828',
      },
      {
        main: '#5e35b1',
        light: '#EDE7F6',
        dark: '#4527a0',
      },
    ];
    let hash = 0;
    for (let i = 0; i < groupId.length; i++) {
      hash = groupId.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const activeGroupIdRef = useRef<string | null>(activeGroupId);
  activeGroupIdRef.current = activeGroupId;

  const handleGroupClick = React.useCallback(
    (groupId: string) => {
      setActiveGroupId(activeGroupIdRef.current === groupId ? null : groupId);
    },
    [setActiveGroupId],
  );

  // 설비별 주간 합계 계산
  const equipmentWeeklyStats = useMemo(() => {
    const stats = new Map<string, { count: number; qty: number }>();

    equipments.forEach((equipment) => {
      let totalCount = 0;
      let totalQty = 0;

      weekDays.forEach((day, dayIndex) => {
        if (!visibleDays[dayIndex]) return; // 숨김 요일 제외

        const dateStr = formatDate(day, 'YYYY-MM-DD');
        const dayPlans = getPlansForDateAndEquipment(
          dateStr,
          equipment.equipCd || '',
        );

        totalCount += dayPlans.length;
        totalQty += dayPlans.reduce(
          (sum, plan) => sum + (plan.plannedQty ?? 0),
          0,
        );
      });

      if (equipment.equipCd) {
        stats.set(equipment.equipCd, { count: totalCount, qty: totalQty });
      }
    });

    return stats;
  }, [
    equipments,
    weekDays,
    visibleDays,
    formatDate,
    getPlansForDateAndEquipment,
  ]);

  return (
    <Paper
      ref={weeklyGridRef}
      sx={{ flex: 1, overflow: 'hidden', boxShadow: 2 }}
    >
      {showRefreshingIndicator && <LinearProgress sx={{ height: 3 }} />}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          px: 1.5,
          py: 0.875,
          minWidth: 0,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: '#f7f9fc',
        }}
      >
        <Tooltip title="왼쪽으로 1일 이동">
          <span>
            <IconButton
              size="small"
              onClick={() => scrollByAmount('left')}
              disabled={!canScrollHorizontally}
              sx={scrollButtonSx}
            >
              <ChevronLeftIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color: '#29486e',
              letterSpacing: '0.02em',
              whiteSpace: 'nowrap',
            }}
          >
            가로 탐색
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              minWidth: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {canScrollHorizontally
              ? 'Shift + 휠로 가로 이동할 수 있습니다.'
              : '현재 범위가 화면에 모두 표시됩니다.'}
          </Typography>
        </Box>
        <Tooltip title="오른쪽으로 1일 이동">
          <span>
            <IconButton
              size="small"
              onClick={() => scrollByAmount('right')}
              disabled={!canScrollHorizontally}
              sx={scrollButtonSx}
            >
              <ChevronRightIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </Box>
      <TableContainer
        ref={tableContainerRef}
        onWheel={handleTableWheel}
        sx={{
          height: '100%',
          overflowX: 'auto',
          ...tableScrollbarSx,
        }}
      >
        <Table
          stickyHeader
          size={compactMode ? 'small' : 'medium'}
          sx={{
            tableLayout: 'fixed',
            ...(isEmptyState && { height: '100%' }),
          }}
        >
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
                  fontSize: compactMode ? '0.85rem' : '0.95rem',
                  borderRight: '1px solid rgba(224, 224, 224, 1)',
                  p: compactMode ? 0.75 : 1,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ViewWeekIcon />
                  설비
                </Box>
              </TableCell>
              {visibleDayColumns.map(
                ({
                  date,
                  dateStr,
                  isToday,
                  isWeekendDay,
                  totalPlans,
                  totalQty,
                  dayColWidth,
                }) => (
                  <TableCell
                    key={dateStr}
                    data-day-col="true"
                    align="center"
                    sx={{
                      minWidth: dayColWidth,
                      width: dayColWidth,
                      maxWidth: dayColWidth,
                      bgcolor: isToday
                        ? 'warning.main'
                        : isWeekendDay
                          ? 'grey.400'
                          : 'primary.main',
                      color: 'white',
                      fontWeight: 'bold',
                      borderRight: '1px solid rgba(224, 224, 224, 1)',
                      p: compactMode ? 0.75 : 1,
                      fontSize: compactMode ? '0.85rem' : '0.95rem',
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
                        {formatDate(date, 'ddd')}요일
                      </Typography>
                      <Typography
                        variant={compactMode ? 'subtitle1' : 'h6'}
                        sx={{ fontWeight: 700, lineHeight: 1.1 }}
                      >
                        {formatDate(date, 'MM/DD')}
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
                ),
              )}
            </TableRow>
          </TableHead>
          <TableBody sx={isEmptyState ? { height: '100%' } : undefined}>
            {showInitialSkeleton ? (
              // 스켈레톤 UI
              Array.from({ length: 3 }).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  <TableCell
                    sx={{
                      position: 'sticky',
                      left: 0,
                      zIndex: 2,
                      bgcolor: 'white',
                      borderRight: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Skeleton
                        variant="circular"
                        width={32}
                        height={32}
                        sx={{ mr: 1 }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Skeleton variant="text" width="60%" />
                        <Skeleton variant="text" width="40%" />
                      </Box>
                    </Box>
                  </TableCell>
                  {visibleDayColumns.map(({ dateStr }) => {
                    return (
                      <TableCell
                        key={`skeleton-day-${dateStr}`}
                        sx={{
                          verticalAlign: 'top',
                          p: cellPadding,
                          borderRight: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <Skeleton
                          variant="rectangular"
                          height={compactMode ? 80 : 120}
                          sx={{ borderRadius: 1 }}
                        />
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : equipments.length === 0 ? (
              <TableRow sx={{ height: '100%' }}>
                <TableCell colSpan={emptyColSpan} sx={{ p: 0, height: '100%' }}>
                  <Box
                    sx={{
                      width: '100%',
                      height: '100%',
                      minHeight: compactMode ? 240 : 320,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      opacity: 0.6,
                    }}
                  >
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
                const isExpanded = expandedEquipments.has(
                  equipment.equipCd || '',
                );
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
                        onClick={() => toggleEquipment(equipment.equipCd || '')}
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
                              sx={{
                                fontWeight: 700,
                                color: 'text.primary',
                                lineHeight: 1.2,
                              }}
                            >
                              {equipment.equipmentName}
                            </Typography>
                            <Chip
                              label={equipment.equipCd}
                              size="small"
                              sx={{ mt: 0.25 }}
                            />
                            {(() => {
                              const stats = equipmentWeeklyStats.get(
                                equipment.equipCd || '',
                              );
                              if (
                                !stats ||
                                (stats.count === 0 && stats.qty === 0)
                              ) {
                                return null; // 0값 숨김
                              }

                              return (
                                <Box
                                  sx={{
                                    display: 'flex',
                                    gap: 0.5,
                                    mt: 0.5,
                                    flexWrap: 'wrap',
                                  }}
                                >
                                  {stats.count > 0 && (
                                    <Chip
                                      label={`${stats.count}건`}
                                      size="small"
                                      color="error"
                                      sx={{
                                        fontSize: compactMode
                                          ? '0.7rem'
                                          : '0.75rem',
                                        fontWeight: 600,
                                      }}
                                    />
                                  )}
                                  {stats.qty > 0 && (
                                    <Chip
                                      label={`${stats.qty.toLocaleString()}개`}
                                      size="small"
                                      sx={{
                                        fontSize: compactMode
                                          ? '0.7rem'
                                          : '0.75rem',
                                        fontWeight: 600,
                                      }}
                                    />
                                  )}
                                </Box>
                              );
                            })()}
                          </Box>
                        </Box>
                      </TableCell>
                      {visibleDayColumns.map(
                        ({ dateStr, isWeekendDay, dayColWidth }) => {
                          const dayPlans = getPlansForDateAndEquipment(
                            dateStr,
                            equipment.equipCd || '',
                          );
                          const hasPlans = dayPlans.length > 0;

                          return (
                            <TableCell
                              key={dateStr}
                              sx={{
                                verticalAlign: 'top',
                                backgroundColor: isWeekendDay
                                  ? 'grey.100'
                                  : 'white',
                                p: hasPlans ? cellPadding : 0.25,
                                borderRight: '1px solid',
                                borderColor: 'divider',
                                width: dayColWidth,
                                maxWidth: dayColWidth,
                              }}
                            >
                              <Collapse
                                in={isExpanded}
                                timeout="auto"
                                unmountOnExit
                              >
                                <Box
                                  sx={{
                                    minHeight: hasPlans
                                      ? compactMode
                                        ? 60
                                        : 100
                                      : 0,
                                    display: hasPlans ? 'block' : 'flex',
                                    justifyContent: hasPlans
                                      ? 'flex-start'
                                      : 'center',
                                  }}
                                >
                                  {hasPlans ? (
                                    <Button
                                      fullWidth
                                      size="small"
                                      startIcon={<AddIcon />}
                                      onClick={() =>
                                        handleOpenCreateDialog(
                                          dateStr,
                                          equipment.equipCd,
                                        )
                                      }
                                      variant="contained"
                                      sx={{ mb: compactMode ? 0.75 : 1 }}
                                    >
                                      계획 추가
                                    </Button>
                                  ) : (
                                    <Tooltip title="계획 추가">
                                      <IconButton
                                        size="small"
                                        onClick={() =>
                                          handleOpenCreateDialog(
                                            dateStr,
                                            equipment.equipCd,
                                          )
                                        }
                                        sx={{
                                          bgcolor: 'grey.100',
                                          '&:hover': { bgcolor: 'grey.200' },
                                        }}
                                      >
                                        <AddIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  )}

                                  {hasPlans && (
                                    <Stack spacing={compactMode ? 0.75 : 1}>
                                      {dayPlans.map((plan) => {
                                        const isGrouped =
                                          !!plan.planGroupId &&
                                          (plan.createDays ||
                                            plan.totalGroupCount ||
                                            1) > 1;
                                        const groupColor =
                                          isGrouped && plan.planGroupId
                                            ? getGroupColor(plan.planGroupId)
                                            : null;

                                        const isGroupActive =
                                          isGrouped &&
                                          plan.planGroupId === activeGroupId;
                                        return (
                                          <PlanCard
                                            key={plan.id}
                                            plan={plan}
                                            isGroupActive={isGroupActive}
                                            groupColor={groupColor}
                                            isGrouped={isGrouped}
                                            groupSeq={plan.groupSeq || 1}
                                            groupTotal={
                                              plan.totalGroupCount ||
                                              plan.createDays ||
                                              1
                                            }
                                            planDisplayCode={
                                              plan.lotNo?.trim() ||
                                              plan.itemDisplayCode ||
                                              plan.itemCode ||
                                              ''
                                            }
                                            compactMode={compactMode}
                                            cardPadding={cardPadding}
                                            getShiftLabel={getShiftLabel}
                                            getShiftColor={getShiftColor}
                                            getShiftBorderColor={
                                              getShiftBorderColor
                                            }
                                            handleOpenEditDialog={
                                              handleOpenEditDialog
                                            }
                                            handleDelete={handleDelete}
                                            onGroupClick={handleGroupClick}
                                          />
                                        );
                                      })}
                                    </Stack>
                                  )}
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
                        },
                      )}
                    </TableRow>
                  </React.Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default memo(WeeklyGrid);
