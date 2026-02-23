import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Collapse,
  IconButton,
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
  ChevronRight as ChevronRightIcon,
  ChevronLeft as ChevronLeftIcon,
  ViewWeek as ViewWeekIcon,
} from '@mui/icons-material';
import { Equipment } from '../../../types/equipment';
import { ProductionPlanData } from '../../../types/productionPlan';

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
  const topScrollRef = useRef<HTMLDivElement | null>(null);
  const [scrollWidth, setScrollWidth] = useState(0);
  const [clientWidth, setClientWidth] = useState(0);
  // 스타일 상수
  const equipmentColWidth = compactMode ? 180 : 240;
  const dayColMinWidth = compactMode ? 280 : 360;
  const emptyDayColWidth = compactMode ? 120 : 160;
  const cellPadding = compactMode ? 0.75 : 1;
  const cardPadding = compactMode ? 0.75 : 1;

  useEffect(() => {
    const container = tableContainerRef.current;
    const topScroll = topScrollRef.current;
    if (!container || !topScroll) return;

    const updateSizes = () => {
      setScrollWidth(container.scrollWidth);
      setClientWidth(container.clientWidth);
      topScroll.scrollLeft = container.scrollLeft;
    };

    updateSizes();
    const resizeObserver = new ResizeObserver(updateSizes);
    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [weekDays, equipments, loading, compactMode, visibleDays]);

  const handleTopScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const container = tableContainerRef.current;
    if (!container) return;
    container.scrollLeft = event.currentTarget.scrollLeft;
  };

  const handleTableScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const topScroll = topScrollRef.current;
    if (!topScroll) return;
    topScroll.scrollLeft = event.currentTarget.scrollLeft;
  };

  const scrollByAmount = (direction: 'left' | 'right') => {
    const container = tableContainerRef.current;
    const topScroll = topScrollRef.current;
    if (!container) return;
    const headerCell = container.querySelector(
      'th[data-day-col="true"]',
    ) as HTMLElement | null;
    const dayWidth = headerCell?.offsetWidth || dayColMinWidth;
    const scrollStepDays = 1;
    const delta =
      direction === 'left'
        ? -dayWidth * scrollStepDays
        : dayWidth * scrollStepDays;
    const maxScrollLeft = container.scrollWidth - container.clientWidth;
    const nextLeft = Math.max(
      0,
      Math.min(maxScrollLeft, container.scrollLeft + delta),
    );
    container.scrollLeft = nextLeft;
    if (topScroll) {
      topScroll.scrollLeft = nextLeft;
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

  return (
    <Paper
      ref={weeklyGridRef}
      sx={{ flex: 1, overflow: 'hidden', boxShadow: 2 }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 1,
          py: 0.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Tooltip title="왼쪽으로 1일 이동">
          <IconButton
            size="small"
            onClick={() => scrollByAmount('left')}
            sx={{ bgcolor: 'grey.100' }}
          >
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Box
          ref={topScrollRef}
          onScroll={handleTopScroll}
          sx={{
            flex: 1,
            overflowX: 'auto',
            overflowY: 'hidden',
            height: 12,
          }}
        >
          <Box sx={{ width: scrollWidth, height: 1, minWidth: clientWidth }} />
        </Box>
        <Tooltip title="오른쪽으로 1일 이동">
          <IconButton
            size="small"
            onClick={() => scrollByAmount('right')}
            sx={{ bgcolor: 'grey.100' }}
          >
            <ChevronRightIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      <TableContainer
        ref={tableContainerRef}
        onScroll={handleTableScroll}
        sx={{ height: '100%', overflowX: 'auto' }}
      >
        <Table
          stickyHeader
          size={compactMode ? 'small' : 'medium'}
          sx={{ tableLayout: 'fixed' }}
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
              {weekDays.map((day, dayIndex) => {
                if (!visibleDays[dayIndex]) return null;

                const isToday = isSameDay(day, getServerDate());
                const isWeekendDay = isWeekend(day);
                const dateStr = formatDate(day, 'YYYY-MM-DD');
                const totalPlans = getTotalPlansForDate(dateStr);
                const totalQty = getTotalQtyForDate(dateStr);
                const dayColWidth =
                  totalPlans > 0 ? dayColMinWidth : emptyDayColWidth;

                return (
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
            {loading ? (
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
                  {weekDays.map((day, dayIndex) => {
                    if (!visibleDays[dayIndex]) return null;
                    return (
                      <TableCell
                        key={`skeleton-day-${dayIndex}`}
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
                          </Box>
                        </Box>
                      </TableCell>
                      {weekDays.map((day, dayIndex) => {
                        if (!visibleDays[dayIndex]) return null;

                        const dateStr = formatDate(day, 'YYYY-MM-DD');
                        const dayPlans = getPlansForDateAndEquipment(
                          dateStr,
                          equipment.equipCd || '',
                        );
                        const dayTotalPlans = getTotalPlansForDate(dateStr);
                        const hasPlans = dayPlans.length > 0;
                        const isWeekendDay = isWeekend(day);
                        const dayColWidth =
                          dayTotalPlans > 0 ? dayColMinWidth : emptyDayColWidth;

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
                                      const groupSeq = plan.groupSeq || 1;
                                      const groupTotal =
                                        plan.totalGroupCount ||
                                        plan.createDays ||
                                        1;

                                      const groupColor =
                                        isGrouped && plan.planGroupId
                                          ? getGroupColor(plan.planGroupId)
                                          : null;

                                      const isGroupActive =
                                        isGrouped &&
                                        plan.planGroupId === activeGroupId;

                                      return (
                                        <Card
                                          key={plan.id}
                                          elevation={0}
                                          sx={{
                                            '&:hover': {
                                              transform: 'translateY(-2px)',
                                            },
                                            transition: 'all 0.3s ease',
                                            borderLeft: '4px solid',
                                            borderColor:
                                              groupColor?.main ||
                                              getShiftBorderColor(plan.shift),
                                            position: 'relative',
                                            // 그룹 활성화 시 점선 테두리
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
                                                  <Typography
                                                    variant="body2"
                                                    sx={{
                                                      fontWeight: 600,
                                                      fontSize: compactMode
                                                        ? '0.85rem'
                                                        : '1rem',
                                                      color: 'text.primary',
                                                    }}
                                                  >
                                                    {plan.itemName}
                                                    {(plan.itemDisplayCode ||
                                                      plan.itemCode) && (
                                                      <Typography
                                                        component="span"
                                                        variant="body2"
                                                        sx={{
                                                          ml: 1,
                                                          color: 'primary.main',
                                                          fontSize: compactMode
                                                            ? '0.8rem'
                                                            : '0.95rem',
                                                          fontWeight: 500,
                                                        }}
                                                      >
                                                        (
                                                        {plan.itemDisplayCode ||
                                                          plan.itemCode}
                                                        )
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
                                                        setActiveGroupId(
                                                          activeGroupId ===
                                                            plan.planGroupId
                                                            ? null
                                                            : plan.planGroupId ||
                                                                null,
                                                        );
                                                      }}
                                                      sx={{
                                                        borderColor:
                                                          groupColor?.main,
                                                        color: groupColor?.dark,
                                                        ml: 0.5,
                                                        fontWeight: 700,
                                                        backgroundColor:
                                                          isGroupActive
                                                            ? groupColor?.light
                                                            : 'white',
                                                        cursor: 'pointer',
                                                        '&:hover': {
                                                          backgroundColor:
                                                            groupColor?.light,
                                                        },
                                                      }}
                                                    />
                                                  )}
                                                </Box>

                                                {/* 2줄: 수량, 담당자, 근무구분, 거래처 */}
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
                                                      plan.shift,
                                                    )}
                                                    size="small"
                                                    color={getShiftColor(
                                                      plan.shift,
                                                    )}
                                                  />
                                                  {plan.orderFlag ===
                                                    'ORDERED' && (
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
                                                          plan
                                                            .additionalCustomers
                                                            .length > 0
                                                        ) {
                                                          alert(
                                                            `거래처 목록:\n- ${
                                                              plan.customerName
                                                            }\n- ${plan.additionalCustomers.join(
                                                              '\n- ',
                                                            )}`,
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
  );
};

export default WeeklyGrid;
