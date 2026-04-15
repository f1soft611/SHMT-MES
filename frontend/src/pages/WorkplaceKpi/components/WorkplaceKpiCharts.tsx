import React, { useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Stack,
  Typography,
} from '@mui/material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { WorkplaceKpiSummaryRow } from '../../../types/workplaceKpi';

interface Props {
  summaryRows: WorkplaceKpiSummaryRow[];
}

/** yyyyMMdd → MM/dd */
function fmtDate(d: string): string {
  return d.length === 8 ? `${d.slice(4, 6)}/${d.slice(6, 8)}` : d;
}

const WorkplaceKpiCharts: React.FC<Props> = ({ summaryRows }) => {
  /** KPI 카드용 집계 */
  const kpi = useMemo(() => {
    const totalProd = summaryRows.reduce(
      (acc, r) => acc + (r.totalProdQty ?? 0),
      0,
    );
    const totalGood = summaryRows.reduce(
      (acc, r) => acc + (r.totalGoodQty ?? 0),
      0,
    );
    const totalBad = summaryRows.reduce(
      (acc, r) => acc + (r.totalBadQty ?? 0),
      0,
    );
    const totalWorkTime = summaryRows.reduce(
      (acc, r) => acc + (r.totalWorkTime ?? 0),
      0,
    );
    const avgBad = totalProd > 0 ? (totalBad / totalProd) * 100 : 0;
    const avgQtyPerHour = totalWorkTime > 0 ? totalProd / totalWorkTime : 0;
    return {
      totalProd,
      totalGood,
      totalBad,
      avgBad,
      totalWorkTime,
      avgQtyPerHour,
    };
  }, [summaryRows]);

  /** 차트 데이터: 날짜 기준 집계 합산 */
  const chartData = useMemo(() => {
    const map = new Map<
      string,
      {
        prodQty: number;
        goodQty: number;
        badQty: number;
        badRate: number;
        cnt: number;
      }
    >();
    for (const r of summaryRows) {
      const key = r.workDate;
      const prev = map.get(key) ?? {
        prodQty: 0,
        goodQty: 0,
        badQty: 0,
        badRate: 0,
        cnt: 0,
      };
      map.set(key, {
        prodQty: prev.prodQty + (r.totalProdQty ?? 0),
        goodQty: prev.goodQty + (r.totalGoodQty ?? 0),
        badQty: prev.badQty + (r.totalBadQty ?? 0),
        badRate: 0, // 아래서 재계산
        cnt: prev.cnt + 1,
      });
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, v]) => ({
        date: fmtDate(date),
        생산수량: Math.round(v.prodQty),
        양품수량: Math.round(v.goodQty),
        불량수량: Math.round(v.badQty),
        불량률:
          v.prodQty > 0
            ? parseFloat(((v.badQty / v.prodQty) * 100).toFixed(2))
            : 0,
      }));
  }, [summaryRows]);

  const kpiCardSx = {
    flex: 1,
    minWidth: 120,
    borderRadius: 2,
    p: 1.5,
    textAlign: 'center' as const,
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* KPI 카드 - 2행 × 3열 */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {/* Row 1: 생산·작업시간·시간당생산 */}
        <Stack direction="row" spacing={1} useFlexGap>
          <Card sx={{ ...kpiCardSx, bgcolor: '#e3f2fd' }}>
            <Typography variant="caption" color="text.secondary">
              총 생산수량
            </Typography>
            <Typography variant="h6" fontWeight={700} color="primary.main">
              {kpi.totalProd.toLocaleString()}
            </Typography>
          </Card>
          <Card sx={{ ...kpiCardSx, bgcolor: '#e8eaf6' }}>
            <Typography variant="caption" color="text.secondary">
              총 작업시간(h)
            </Typography>
            <Typography variant="h6" fontWeight={700} color="#3949ab">
              {kpi.totalWorkTime.toFixed(1)}
            </Typography>
          </Card>
          <Card sx={{ ...kpiCardSx, bgcolor: '#e0f7fa' }}>
            <Typography variant="caption" color="text.secondary">
              시간당 생산
            </Typography>
            <Typography variant="h6" fontWeight={700} color="#00838f">
              {kpi.avgQtyPerHour.toFixed(1)}
            </Typography>
          </Card>
        </Stack>
        {/* Row 2: 양품·불량·불량률 */}
        <Stack direction="row" spacing={1} useFlexGap>
          <Card sx={{ ...kpiCardSx, bgcolor: '#e8f5e9' }}>
            <Typography variant="caption" color="text.secondary">
              총 양품수량
            </Typography>
            <Typography variant="h6" fontWeight={700} color="success.main">
              {kpi.totalGood.toLocaleString()}
            </Typography>
          </Card>
          <Card sx={{ ...kpiCardSx, bgcolor: '#fce4ec' }}>
            <Typography variant="caption" color="text.secondary">
              총 불량수량
            </Typography>
            <Typography variant="h6" fontWeight={700} color="error.main">
              {kpi.totalBad.toLocaleString()}
            </Typography>
          </Card>
          <Card sx={{ ...kpiCardSx, bgcolor: '#fff8e1' }}>
            <Typography variant="caption" color="text.secondary">
              평균 불량률
            </Typography>
            <Typography variant="h6" fontWeight={700} color="warning.main">
              {kpi.avgBad.toFixed(2)}%
            </Typography>
          </Card>
        </Stack>
      </Box>

      {summaryRows.length === 0 ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: 200,
          }}
        >
          <Chip label="데이터가 없습니다" variant="outlined" />
        </Box>
      ) : (
        <>
          {/* 일별 생산 수량 BarChart */}
          <Card>
            <CardHeader
              title="일별 생산·양품·불량 현황"
              titleTypographyProps={{ variant: 'subtitle2', fontWeight: 600 }}
              sx={{ pb: 0 }}
            />
            <CardContent sx={{ pt: 1 }}>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={chartData}
                  margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar
                    dataKey="생산수량"
                    fill="#1976d2"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="양품수량"
                    fill="#2e7d32"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="불량수량"
                    fill="#c62828"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 불량률 추이 LineChart */}
          <Card>
            <CardHeader
              title="일별 불량률 추이"
              titleTypographyProps={{ variant: 'subtitle2', fontWeight: 600 }}
              sx={{ pb: 0 }}
            />
            <CardContent sx={{ pt: 1 }}>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart
                  data={chartData}
                  margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v: number) => `${v}%`}
                    domain={[0, 'auto']}
                  />
                  <Tooltip
                    formatter={(value) =>
                      value != null
                        ? [`${Number(value).toFixed(2)}%`, '불량률']
                        : ['0.00%', '불량률']
                    }
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line
                    type="monotone"
                    dataKey="불량률"
                    stroke="#e65100"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
};

export default WorkplaceKpiCharts;
