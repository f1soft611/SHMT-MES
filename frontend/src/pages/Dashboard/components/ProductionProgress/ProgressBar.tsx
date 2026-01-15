import React from 'react';
import { Box, LinearProgress, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

interface ProgressBarProps {
  value: number;
  label?: string;
  showPercentage?: boolean;
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  height?: number;
}

const StyledLinearProgress = styled(LinearProgress)<{ height?: number }>(
  ({ theme, height = 10 }) => ({
    height: height,
    borderRadius: 5,
    backgroundColor: theme.palette.grey[200],
    '& .MuiLinearProgress-bar': {
      borderRadius: 5,
    },
  })
);

/**
 * 진행률 바 컴포넌트
 */
const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  label,
  showPercentage = true,
  color = 'primary',
  height = 10,
}) => {
  // 값 범위 제한 (0-100)
  const normalizedValue = Math.min(Math.max(value, 0), 100);

  // 색상 결정 (완료율에 따라)
  const getProgressColor = (): typeof color => {
    if (normalizedValue >= 100) return 'success';
    if (normalizedValue >= 80) return 'primary';
    if (normalizedValue >= 50) return 'info';
    if (normalizedValue >= 30) return 'warning';
    return 'error';
  };

  const progressColor = color === 'primary' ? getProgressColor() : color;

  return (
    <Box sx={{ width: '100%' }}>
      {/* 라벨과 퍼센트 */}
      {(label || showPercentage) && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 0.5,
          }}
        >
          {label && (
            <Typography variant="body2" color="text.secondary">
              {label}
            </Typography>
          )}
          {showPercentage && (
            <Typography
              variant="body2"
              fontWeight="bold"
              color={
                progressColor === 'success' ? 'success.main' : 'text.primary'
              }
            >
              {normalizedValue.toFixed(1)}%
            </Typography>
          )}
        </Box>
      )}

      {/* 프로그레스 바 */}
      <StyledLinearProgress
        variant="determinate"
        value={normalizedValue}
        color={progressColor}
        height={height}
      />
    </Box>
  );
};

export default ProgressBar;
