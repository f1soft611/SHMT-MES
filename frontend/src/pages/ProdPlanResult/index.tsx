import React, { Fragment, useMemo, useRef } from 'react';
import dayjs from 'dayjs';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import {
  BarChart as BarChartIcon,
  ChevronLeft,
  ChevronRight,
  ExpandLess,
  ExpandMore,
  TableView as TableViewIcon,
} from '@mui/icons-material';
import { useProdPlanResult } from './hooks/useProdPlanResult';
import ProdPlanResultSearchFilter from './components/ProdPlanResultSearchFilter';
import { ProdPlanResultRow } from '../../types/prodPlanResult';

const formatNumber = (value?: number) =>
  value ? value.toLocaleString('ko-KR') : '';

const formatCellValue = (value: number, rowType: string) => {
  if (!value) {
    return '';
  }
  if (rowType === 'RATE') {
    return `${value}%`;
  }
  return formatNumber(value);
};

const getWeekBoundaries = (daysInMonth: number) => {
  const boundaries = [7, 14, 21, 28, daysInMonth];
  return boundaries.filter((value, index) => {
    if (index < boundaries.length - 1) {
      return value < daysInMonth;
    }
    return true;
  });
};

const columnWidths = {
  workplace: 80,
  monthTarget: 90,
  monthPlan: 80,
  orderBacklog: 80,
  nextMonthCarry: 80,
  rowType: 80,
  total: 90,
  day: 90,
  week: 115,
};

const tableFontSizes = {
  header: '0.84rem',
  body: '0.8rem',
  chip: '0.74rem',
};

const getWeekIndex = (day: number, boundaries: number[]) => {
  for (let i = 0; i < boundaries.length; i += 1) {
    if (day <= boundaries[i]) return i;
  }
  return boundaries.length - 1;
};

const getWeekLength = (weekIndex: number, boundaries: number[]) => {
  const end = boundaries[weekIndex] ?? boundaries[boundaries.length - 1];
  const start = weekIndex === 0 ? 1 : boundaries[weekIndex - 1] + 1;
  return Math.max(end - start + 1, 1);
};

const COLLAPSED_WEEKS_STORAGE_KEY = 'prodPlanResult.collapsedWeeks';

const ProdPlanResult: React.FC = () => {
  const { yearMonth, setYearMonth, rows, loading, handleSearch } =
    useProdPlanResult();

  const tableContainerRef = useRef<HTMLDivElement | null>(null);

  const [collapsedWeeks, setCollapsedWeeks] = React.useState<number[]>(() => {
    try {
      const stored = sessionStorage.getItem(COLLAPSED_WEEKS_STORAGE_KEY);
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed)
        ? parsed.filter((value) => Number.isInteger(value))
        : [];
    } catch {
      return [];
    }
  });

  const [showSearchFields, setShowSearchFields] = React.useState(true);

  const daysInMonth = useMemo(() => {
    if (!yearMonth) return 31;
    return dayjs(`${yearMonth}-01`).daysInMonth();
  }, [yearMonth]);

  const dayNumbers = useMemo(
    () => Array.from({ length: daysInMonth }, (_, index) => index + 1),
    [daysInMonth],
  );

  const weekBoundaries = useMemo(
    () => getWeekBoundaries(daysInMonth),
    [daysInMonth],
  );

  const isWeekendDay = (day: number) => {
    if (!yearMonth) return false;
    const date = dayjs(`${yearMonth}-${String(day).padStart(2, '0')}`);
    const dayOfWeek = date.day();
    return dayOfWeek === 0 || dayOfWeek === 6;
  };

  const toggleWeek = (weekIndex: number) => {
    setCollapsedWeeks((prev) =>
      prev.includes(weekIndex)
        ? prev.filter((week) => week !== weekIndex)
        : [...prev, weekIndex],
    );
  };

  React.useEffect(() => {
    try {
      sessionStorage.setItem(
        COLLAPSED_WEEKS_STORAGE_KEY,
        JSON.stringify(collapsedWeeks),
      );
    } catch {
      // ignore
    }
  }, [collapsedWeeks]);

  const rowsWithSpan = useMemo(() => {
    const counts = new Map<string, number>();
    rows.forEach((row) => {
      counts.set(row.workplaceCode, (counts.get(row.workplaceCode) ?? 0) + 1);
    });

    const seen = new Set<string>();
    return rows.map((row) => {
      const showWorkplace = !seen.has(row.workplaceCode);
      if (showWorkplace) {
        seen.add(row.workplaceCode);
      }
      return {
        row,
        showWorkplace,
        rowSpan: showWorkplace ? (counts.get(row.workplaceCode) ?? 1) : 0,
      };
    });
  }, [rows]);

  const scrollByWeek = (direction: 'prev' | 'next') => {
    const container = tableContainerRef.current;
    if (!container) return;

    const weekCells = Array.from(
      container.querySelectorAll<HTMLElement>('[data-week-index]'),
    );

    if (weekCells.length === 0) return;

    const offsets = weekCells
      .map((cell) => cell.offsetLeft)
      .filter((value, index, self) => self.indexOf(value) === index)
      .sort((a, b) => a - b);

    const allOffsets = [0, ...offsets];
    const current = container.scrollLeft;
    const currentIndex = allOffsets.findIndex(
      (offset) => Math.abs(offset - current) < 2,
    );

    const normalizedIndex =
      currentIndex === -1
        ? allOffsets.findIndex((offset) => offset > current + 1)
        : currentIndex;

    const nextIndex =
      direction === 'next'
        ? Math.min(normalizedIndex + 1, allOffsets.length - 1)
        : Math.max(normalizedIndex - 1, 0);

    const target = allOffsets[nextIndex];
    if (target !== undefined) {
      container.scrollTo({ left: target, behavior: 'smooth' });
    }
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
          <Typography variant="h5">생산 계획 대비 실적 현황</Typography>
        </Box>
      </Box>

      <ProdPlanResultSearchFilter
        showSearchFields={showSearchFields}
        onToggle={() => setShowSearchFields((prev) => !prev)}
        yearMonth={yearMonth}
        onYearMonthChange={setYearMonth}
        onSearch={handleSearch}
      />

      <Card>
        <CardContent sx={{ p: 0 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 2,
              py: 1.5,
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <BarChartIcon sx={{ color: 'primary.main', fontSize: 20 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                월별 집계
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => scrollByWeek('prev')}
                startIcon={<ChevronLeft fontSize="small" />}
              >
                이전 주차
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => scrollByWeek('next')}
                endIcon={<ChevronRight fontSize="small" />}
              >
                다음 주차
              </Button>
            </Box>
          </Box>
          <Box sx={{ position: 'relative' }}>
            {loading && (
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(255,255,255,0.6)',
                  zIndex: 10,
                }}
              >
                <CircularProgress size={40} />
              </Box>
            )}
            <TableContainer
              component={Paper}
              ref={tableContainerRef}
              sx={{
                overflowX: 'auto',
                maxHeight: 620,
              }}
            >
              <Table
                stickyHeader
                sx={{
                  width: 'max-content',
                  minWidth: 2000,
                  '& .MuiTableCell-root': {
                    border: '1px solid #c7c7c7',
                    whiteSpace: 'nowrap',
                    fontSize: tableFontSizes.body,
                  },
                }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell
                      align="center"
                      sx={{
                        minWidth: columnWidths.workplace,
                        bgcolor: 'grey.100',
                        fontWeight: 700,
                        fontSize: tableFontSizes.header,
                        position: 'sticky',
                        left: 0,
                        zIndex: 4,
                        borderRight: '2px solid #bbb',
                      }}
                    >
                      작업장
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        minWidth: columnWidths.monthTarget,
                        bgcolor: 'grey.100',
                        fontWeight: 700,
                        fontSize: tableFontSizes.header,
                      }}
                    >
                      금월생산목표
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        minWidth: columnWidths.monthPlan,
                        bgcolor: 'grey.100',
                        fontWeight: 700,
                        fontSize: tableFontSizes.header,
                      }}
                    >
                      금월계획
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        minWidth: columnWidths.orderBacklog,
                        bgcolor: 'grey.100',
                        fontWeight: 700,
                        fontSize: tableFontSizes.header,
                      }}
                    >
                      수주잔량
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        minWidth: columnWidths.nextMonthCarry,
                        bgcolor: 'grey.100',
                        fontWeight: 700,
                        fontSize: tableFontSizes.header,
                      }}
                    >
                      차월이월
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        minWidth: columnWidths.rowType,
                        bgcolor: 'grey.100',
                        fontWeight: 700,
                        fontSize: tableFontSizes.header,
                        borderRight: '2px solid #bbb',
                      }}
                    >
                      구분
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        minWidth: columnWidths.total,
                        bgcolor: 'grey.100',
                        fontWeight: 700,
                        fontSize: tableFontSizes.header,
                      }}
                    >
                      계
                    </TableCell>
                    {dayNumbers.map((day) => {
                      const weekIndex = getWeekIndex(day, weekBoundaries);
                      const boundaryIndex = weekBoundaries.indexOf(day);
                      const isCollapsed = collapsedWeeks.includes(weekIndex);

                      if (isCollapsed && boundaryIndex === -1) {
                        return null;
                      }

                      const cells: React.ReactNode[] = [];

                      if (!isCollapsed) {
                        const weekend = isWeekendDay(day);
                        cells.push(
                          <TableCell
                            key={`day-${day}`}
                            align="center"
                            sx={{
                              minWidth: columnWidths.day,
                              bgcolor: weekend ? '#D9E1F2' : 'grey.100',
                              fontWeight: 600,
                              fontSize: tableFontSizes.header,
                            }}
                          >
                            {day}
                          </TableCell>,
                        );
                      }

                      if (boundaryIndex !== -1) {
                        const label = `${boundaryIndex + 1}주소계`;
                        const weekLength = getWeekLength(
                          boundaryIndex,
                          weekBoundaries,
                        );
                        cells.push(
                          <TableCell
                            key={`week-${boundaryIndex + 1}`}
                            align="center"
                            data-week-index={boundaryIndex}
                            colSpan={isCollapsed ? weekLength : 1}
                            sx={{
                              minWidth: columnWidths.week,
                              backgroundColor: '#B4C6E7',
                              fontWeight: 700,
                              fontSize: tableFontSizes.header,
                            }}
                          >
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 0.25,
                              }}
                            >
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 700,
                                  fontSize: tableFontSizes.header,
                                }}
                              >
                                {label}
                              </Typography>
                              <IconButton
                                size="small"
                                onClick={() => toggleWeek(boundaryIndex)}
                                sx={{ p: 0.25 }}
                              >
                                {collapsedWeeks.includes(boundaryIndex) ? (
                                  <ExpandMore fontSize="small" />
                                ) : (
                                  <ExpandLess fontSize="small" />
                                )}
                              </IconButton>
                            </Box>
                          </TableCell>,
                        );
                      }

                      return <Fragment key={`group-${day}`}>{cells}</Fragment>;
                    })}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7 + daysInMonth + weekBoundaries.length}
                        align="center"
                        sx={{ height: 160, color: 'text.disabled' }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 1,
                          }}
                        >
                          <TableViewIcon sx={{ fontSize: 48, opacity: 0.35 }} />
                          <Typography variant="body2">
                            조회된 데이터가 없습니다. 연월을 선택 후
                            조회해주세요.
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    rowsWithSpan.map(
                      ({ row, showWorkplace, rowSpan }, rowIndex) => (
                        <ResultRow
                          key={`${row.workplaceCode}-${rowIndex}-${row.rowType}`}
                          row={row}
                          weekBoundaries={weekBoundaries}
                          collapsedWeeks={collapsedWeeks}
                          isWeekendDay={isWeekendDay}
                          showWorkplace={showWorkplace}
                          rowSpan={rowSpan}
                        />
                      ),
                    )
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

const ResultRow = ({
  row,
  weekBoundaries,
  collapsedWeeks,
  isWeekendDay,
  showWorkplace,
  rowSpan,
}: {
  row: ProdPlanResultRow;
  weekBoundaries: number[];
  collapsedWeeks: number[];
  isWeekendDay: (day: number) => boolean;
  showWorkplace: boolean;
  rowSpan: number;
}) => {
  const isRate = row.rowType === 'RATE';

  return (
    <TableRow sx={{ bgcolor: isRate ? 'rgba(255,192,0,0.08)' : undefined }}>
      {showWorkplace && (
        <TableCell
          align="center"
          rowSpan={rowSpan}
          sx={{
            minWidth: columnWidths.workplace,
            position: 'sticky',
            left: 0,
            bgcolor: 'background.paper',
            zIndex: 1,
            borderRight: '2px solid #bbb',
            fontWeight: 600,
          }}
        >
          {row.workplaceName}
        </TableCell>
      )}
      {showWorkplace && (
        <>
          <TableCell
            align="right"
            rowSpan={rowSpan}
            sx={{
              minWidth: columnWidths.monthTarget,
            }}
          >
            {formatNumber(row.monthTarget)}
          </TableCell>
          <TableCell
            align="right"
            rowSpan={rowSpan}
            sx={{ minWidth: columnWidths.monthPlan }}
          >
            {formatNumber(row.monthPlan)}
          </TableCell>
          <TableCell
            align="right"
            rowSpan={rowSpan}
            sx={{
              minWidth: columnWidths.orderBacklog,
            }}
          >
            {formatNumber(row.orderBacklog)}
          </TableCell>
          <TableCell
            align="right"
            rowSpan={rowSpan}
            sx={{
              minWidth: columnWidths.nextMonthCarry,
              backgroundColor: '#FFF0ED',
              color: 'error.main',
            }}
          >
            {formatNumber(row.nextMonthCarry)}
          </TableCell>
        </>
      )}
      <TableCell
        align="center"
        sx={{
          minWidth: columnWidths.rowType,
          borderRight: '2px solid #bbb',
        }}
      >
        <RowTypeChip rowType={row.rowType} label={row.rowTypeName} />
      </TableCell>
      <TableCell
        align="right"
        sx={{
          minWidth: columnWidths.total,
          backgroundColor: row.rowType === 'RATE' ? '#FFC000' : '#FFFFCC',
          fontWeight: 600,
        }}
      >
        {formatCellValue(row.total, row.rowType)}
      </TableCell>

      {row.days.map((value, index) => {
        const day = index + 1;
        const weekIndexForDay = getWeekIndex(day, weekBoundaries);
        if (collapsedWeeks.includes(weekIndexForDay)) {
          if (weekBoundaries[weekIndexForDay] === day) {
            const weekTotal = row.weekTotals[weekIndexForDay] ?? 0;
            const weekLength = getWeekLength(weekIndexForDay, weekBoundaries);
            return (
              <TableCell
                key={`week-${weekIndexForDay + 1}`}
                align="right"
                colSpan={weekLength}
                sx={{
                  minWidth: columnWidths.week,
                  backgroundColor:
                    row.rowType === 'RATE' ? '#FFC000' : '#B4C6E7',
                }}
              >
                {formatCellValue(weekTotal, row.rowType)}
              </TableCell>
            );
          }
          return null;
        }
        const cells = [
          <TableCell
            key={`day-${day}`}
            align="right"
            sx={{
              minWidth: columnWidths.day,
              backgroundColor: isWeekendDay(day)
                ? '#D9E1F2'
                : isRate
                  ? '#FFC000'
                  : undefined,
            }}
          >
            {formatCellValue(value, row.rowType)}
          </TableCell>,
        ];

        if (weekBoundaries[weekIndexForDay] === day) {
          const weekTotal = row.weekTotals[weekIndexForDay] ?? 0;
          cells.push(
            <TableCell
              key={`week-${weekIndexForDay + 1}`}
              align="right"
              sx={{
                minWidth: columnWidths.week,
                backgroundColor: row.rowType === 'RATE' ? '#FFC000' : '#B4C6E7',
              }}
            >
              {formatCellValue(weekTotal, row.rowType)}
            </TableCell>,
          );
        }

        return <Fragment key={`cell-${row.rowType}-${day}`}>{cells}</Fragment>;
      })}
    </TableRow>
  );
};

const RowTypeChip = ({
  rowType,
  label,
}: {
  rowType: string;
  label: string;
}) => {
  if (rowType === 'PLAN') {
    return (
      <Chip
        label={label}
        size="small"
        color="primary"
        variant="outlined"
        sx={{ fontSize: tableFontSizes.chip, height: 20 }}
      />
    );
  }
  if (rowType === 'ACTUAL') {
    return (
      <Chip
        label={label}
        size="small"
        color="success"
        variant="filled"
        sx={{ fontSize: tableFontSizes.chip, height: 20 }}
      />
    );
  }
  if (rowType === 'RATE') {
    return (
      <Chip
        label={label}
        size="small"
        color="warning"
        variant="filled"
        sx={{ fontSize: tableFontSizes.chip, height: 20 }}
      />
    );
  }
  return <span>{label}</span>;
};

export default ProdPlanResult;
