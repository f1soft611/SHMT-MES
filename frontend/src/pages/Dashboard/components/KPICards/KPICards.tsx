import React from 'react';
import { Box, Card, CardContent, Typography, Grid } from '@mui/material';
import { DashboardKPI } from '../../../../types/dashboard';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingActionsIcon from '@mui/icons-material/PendingActions';

interface KPICardsProps {
  kpi: DashboardKPI | null;
  loading?: boolean;
}

/**
 * 대시보드 KPI 카드 컴포넌트
 */
const KPICards: React.FC<KPICardsProps> = ({ kpi, loading = false }) => {
  if (loading) {
    return (
      <Grid container spacing={2}>
        {[1, 2, 3, 4].map((i) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
            <Card>
              <CardContent>
                <Box
                  sx={{
                    height: 100,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    로딩 중...
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  if (!kpi) {
    return null;
  }

  const kpiData = [
    {
      title: '금일 계획',
      value: kpi.totalPlanCount,
      subValue: `${kpi.totalPlannedQty.toLocaleString()}개`,
      icon: <AssignmentIcon sx={{ fontSize: 40 }} />,
      color: 'primary.main',
      bgColor: 'primary.light',
    },
    {
      title: '금일 실적',
      value: kpi.totalActualQty.toLocaleString(),
      subValue: `${kpi.completionRate.toFixed(1)}%`,
      icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
      color: 'success.main',
      bgColor: 'success.light',
    },
    {
      title: '진행 중',
      value: kpi.inProgressPlanCount,
      subValue: `${kpi.inProgressQty.toLocaleString()}개`,
      icon: <PendingActionsIcon sx={{ fontSize: 40 }} />,
      color: 'warning.main',
      bgColor: 'warning.light',
    },
    {
      title: '완료',
      value: kpi.completedPlanCount,
      subValue: `${kpi.completedQty.toLocaleString()}개`,
      icon: <CheckCircleIcon sx={{ fontSize: 40 }} />,
      color: 'info.main',
      bgColor: 'info.light',
    },
  ];

  return (
    <Grid container spacing={2}>
      {kpiData.map((item, index) => (
        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
          <Card
            sx={{
              height: '100%',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4,
              },
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 2,
                }}
              >
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{ fontWeight: 600 }}
                >
                  {item.title}
                </Typography>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    bgcolor: item.bgColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: item.color,
                    opacity: 0.8,
                  }}
                >
                  {item.icon}
                </Box>
              </Box>
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, mb: 0.5, color: item.color }}
              >
                {typeof item.value === 'number' && item.value > 999
                  ? item.value.toLocaleString()
                  : item.value}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {item.subValue}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default KPICards;
