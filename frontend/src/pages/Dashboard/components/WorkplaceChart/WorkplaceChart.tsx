import React from 'react';
import { Box, Typography, LinearProgress, Paper } from '@mui/material';
import { WorkplaceProgress } from '../../../../types/dashboard';

interface WorkplaceChartProps {
  workplaceList: WorkplaceProgress[];
  loading?: boolean;
  selectedWorkplace?: string | null;
  onSelectWorkplace?: (workplaceCode: string | null) => void;
}

/**
 * 작업장별 생산 현황 차트 컴포넌트
 */
const WorkplaceChart: React.FC<WorkplaceChartProps> = ({
  workplaceList,
  loading = false,
  selectedWorkplace = null,
  onSelectWorkplace,
}) => {
  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          데이터를 불러오는 중...
        </Typography>
        <LinearProgress />
      </Box>
    );
  }

  if (!workplaceList || workplaceList.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body2" color="text.secondary">
          작업장별 생산 현황 데이터가 없습니다.
        </Typography>
      </Box>
    );
  }

  // 완료율 기준 내림차순 정렬
  const sortedList = [...workplaceList].sort(
    (a, b) => b.completionRate - a.completionRate
  );

  const getProgressColor = (rate: number) => {
    if (rate >= 90) return 'success';
    if (rate >= 70) return 'primary';
    if (rate >= 50) return 'warning';
    return 'error';
  };

  return (
    <Box sx={{ width: '100%' }}>
      {sortedList.map((workplace, index) => {
        const isSelected = selectedWorkplace === workplace.workplaceCode;

        return (
          <Paper
            key={workplace.workplaceCode}
            elevation={isSelected ? 3 : 0}
            sx={{
              p: 2,
              mb: 2,
              border: '1px solid',
              borderColor: isSelected ? 'primary.main' : 'divider',
              bgcolor: isSelected ? 'action.selected' : 'background.paper',
              cursor: 'pointer',
              '&:hover': {
                bgcolor: 'action.hover',
                borderColor: 'primary.main',
              },
              transition: 'all 0.2s',
            }}
            onClick={() => {
              if (onSelectWorkplace) {
                onSelectWorkplace(isSelected ? null : workplace.workplaceCode);
              }
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 1,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {workplace.workplaceName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ({workplace.planCount}건)
                </Typography>
              </Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color:
                    workplace.completionRate >= 90
                      ? 'success.main'
                      : workplace.completionRate >= 70
                      ? 'primary.main'
                      : workplace.completionRate >= 50
                      ? 'warning.main'
                      : 'error.main',
                }}
              >
                {workplace.completionRate.toFixed(1)}%
              </Typography>
            </Box>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mb: 1,
              }}
            >
              <LinearProgress
                variant="determinate"
                value={Math.min(workplace.completionRate, 100)}
                sx={{
                  flexGrow: 1,
                  height: 10,
                  borderRadius: 5,
                }}
                color={getProgressColor(workplace.completionRate)}
              />
            </Box>

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 2,
              }}
            >
              <Box>
                <Typography variant="caption" color="text.secondary">
                  계획
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {workplace.plannedQty.toLocaleString()}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  실적
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: 'success.main' }}
                >
                  {workplace.actualQty.toLocaleString()}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  양품
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: 'info.main' }}
                >
                  {workplace.goodQty.toLocaleString()}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  불량
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: 'error.main' }}
                >
                  {workplace.defectQty.toLocaleString()}
                </Typography>
              </Box>
            </Box>
          </Paper>
        );
      })}
    </Box>
  );
};

export default WorkplaceChart;
