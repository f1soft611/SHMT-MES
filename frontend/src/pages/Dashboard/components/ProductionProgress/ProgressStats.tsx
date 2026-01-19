import React from 'react';
import { Box, Typography, Grid, Divider } from '@mui/material';
import { ProductionProgress } from '../../../../types/dashboard';

interface ProgressStatsProps {
  progress: ProductionProgress;
}

/**
 * 숫자 포맷팅 (천단위 콤마)
 */
const formatNumber = (num: number): string => {
  return num.toLocaleString('ko-KR');
};

/**
 * 생산 통계 정보 컴포넌트
 */
const ProgressStats: React.FC<ProgressStatsProps> = ({ progress }) => {
  return (
    <Box sx={{ mt: 2 }}>
      <Divider sx={{ my: 2 }} />

      {/* 수량 정보 그리드 */}
      <Grid container spacing={2}>
        {/* 계획수량 */}
        <Grid size={{ xs: 6, sm: 3 }} component="div">
          <Box
            sx={{
              textAlign: 'center',
              p: 1.5,
              bgcolor: 'grey.50',
              borderRadius: 1,
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
            >
              계획수량
            </Typography>
            <Typography variant="h6" fontWeight="bold" color="primary.main">
              {formatNumber(progress.plannedQty)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              EA
            </Typography>
          </Box>
        </Grid>

        {/* 실적수량 */}
        <Grid size={{ xs: 6, sm: 3 }} component="div">
          <Box
            sx={{
              textAlign: 'center',
              p: 1.5,
              bgcolor: 'success.50',
              borderRadius: 1,
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
            >
              실적수량
            </Typography>
            <Typography variant="h6" fontWeight="bold" color="success.main">
              {formatNumber(progress.actualQty)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              EA
            </Typography>
          </Box>
        </Grid>

        {/* 잔여수량 */}
        <Grid size={{ xs: 6, sm: 3 }} component="div">
          <Box
            sx={{
              textAlign: 'center',
              p: 1.5,
              bgcolor: 'warning.50',
              borderRadius: 1,
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
            >
              잔여수량
            </Typography>
            <Typography variant="h6" fontWeight="bold" color="warning.main">
              {formatNumber(progress.remainingQty)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              EA
            </Typography>
          </Box>
        </Grid>

        {/* 불량수량 */}
        <Grid size={{ xs: 6, sm: 3 }} component="div">
          <Box
            sx={{
              textAlign: 'center',
              p: 1.5,
              bgcolor: progress.defectQty > 0 ? 'error.50' : 'grey.50',
              borderRadius: 1,
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
            >
              불량수량
            </Typography>
            <Typography
              variant="h6"
              fontWeight="bold"
              color={progress.defectQty > 0 ? 'error.main' : 'text.secondary'}
            >
              {formatNumber(progress.defectQty)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              EA ({progress.defectRate.toFixed(1)}%)
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* 추가 정보 */}
      {(progress.startTime || progress.endTime || progress.remark) && (
        <Box sx={{ mt: 2, p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
          {progress.startTime && (
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
            >
              시작: {progress.startTime}
            </Typography>
          )}
          {progress.endTime && (
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
            >
              종료: {progress.endTime}
            </Typography>
          )}
          {progress.remark && (
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              sx={{ mt: 0.5 }}
            >
              비고: {progress.remark}
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

export default ProgressStats;
