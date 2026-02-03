import React, { Fragment, useMemo, useRef } from 'react';
import dayjs from 'dayjs';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { useProdPlanResult } from './hooks/useProdPlanResult';
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

      <Card sx={{ mb: 2 }}>
        <CardHeader title="조회 조건" titleTypographyProps={{ fontSize: 16 }} />
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              flexWrap: 'wrap',
            }}
          >
            <TextField
              label="조회 연월"
              type="month"
              size="small"
              value={yearMonth}
              onChange={(e) => setYearMonth(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <Button variant="contained" onClick={handleSearch}>
              조회
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ p: 0 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 2,
              pt: 2,
              pb: 2,
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              월별 집계
            </Typography>
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
                overflowX: 'hidden',
                maxHeight: 620,
              }}
            >
              <Table
                stickyHeader
                sx={{
                  minWidth: 2000,
                  tableLayout: 'fixed',
                  '& .MuiTableCell-root': {
                    border: '1px solid #c7c7c7',
                  },
                }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell
                      align="center"
                      sx={{
                        width: columnWidths.workplace,
                        minWidth: columnWidths.workplace,
                      }}
                    >
                      작업장
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        width: columnWidths.monthTarget,
                        minWidth: columnWidths.monthTarget,
                      }}
                    >
                      금월생산목표
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        width: columnWidths.monthPlan,
                        minWidth: columnWidths.monthPlan,
                      }}
                    >
                      금월계획
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        width: columnWidths.orderBacklog,
                        minWidth: columnWidths.orderBacklog,
                      }}
                    >
                      수주잔량
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        width: columnWidths.nextMonthCarry,
                        minWidth: columnWidths.nextMonthCarry,
                      }}
                    >
                      차월이월
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        width: columnWidths.rowType,
                        minWidth: columnWidths.rowType,
                      }}
                    >
                      구분
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        width: columnWidths.total,
                        minWidth: columnWidths.total,
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
                              width: columnWidths.day,
                              minWidth: columnWidths.day,
                              backgroundColor: weekend ? '#D9E1F2' : undefined,
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
                              width: columnWidths.week,
                              minWidth: columnWidths.week,
                              backgroundColor: '#B4C6E7',
                            }}
                          >
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 0.5,
                              }}
                            >
                              <Typography variant="body2">{label}</Typography>
                              <IconButton
                                size="small"
                                onClick={() => toggleWeek(boundaryIndex)}
                                sx={{ p: 0.25 }}
                              >
                                {collapsedWeeks.includes(boundaryIndex) ? (
                                  <ChevronRight fontSize="small" />
                                ) : (
                                  <ChevronLeft fontSize="small" />
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
                        sx={{ height: 120, color: 'text.secondary' }}
                      >
                        조회된 데이터가 없습니다.
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
  const rateCellStyle =
    row.rowType === 'RATE' ? { backgroundColor: '#FFC000' } : undefined;

  return (
    <TableRow>
      {showWorkplace && (
        <TableCell
          align="center"
          rowSpan={rowSpan}
          sx={{
            width: columnWidths.workplace,
            minWidth: columnWidths.workplace,
          }}
        >
          {row.workplaceName}
        </TableCell>
      )}
      <TableCell
        align="right"
        sx={{
          width: columnWidths.monthTarget,
          minWidth: columnWidths.monthTarget,
        }}
      >
        {formatNumber(row.monthTarget)}
      </TableCell>
      <TableCell
        align="right"
        sx={{ width: columnWidths.monthPlan, minWidth: columnWidths.monthPlan }}
      >
        {formatNumber(row.monthPlan)}
      </TableCell>
      <TableCell
        align="right"
        sx={{
          width: columnWidths.orderBacklog,
          minWidth: columnWidths.orderBacklog,
        }}
      >
        {formatNumber(row.orderBacklog)}
      </TableCell>
      <TableCell
        align="right"
        sx={{
          width: columnWidths.nextMonthCarry,
          minWidth: columnWidths.nextMonthCarry,
          backgroundColor: '#FCE4D6',
          color: 'red',
        }}
      >
        {formatNumber(row.nextMonthCarry)}
      </TableCell>
      <TableCell
        align="center"
        sx={{
          width: columnWidths.rowType,
          minWidth: columnWidths.rowType,
          ...rateCellStyle,
        }}
      >
        {row.rowTypeName}
      </TableCell>
      <TableCell
        align="right"
        sx={{
          width: columnWidths.total,
          minWidth: columnWidths.total,
          backgroundColor: row.rowType === 'RATE' ? '#FFC000' : '#FFFFCC',
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
                  width: columnWidths.week,
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
              width: columnWidths.day,
              minWidth: columnWidths.day,
              backgroundColor: isWeekendDay(day) ? '#D9E1F2' : undefined,
              ...rateCellStyle,
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
                width: columnWidths.week,
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

export default ProdPlanResult;
