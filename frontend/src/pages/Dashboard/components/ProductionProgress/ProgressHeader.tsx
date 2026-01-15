import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import {
  ProductionProgress,
  ProgressStatusInfo,
} from '../../../../types/dashboard';

interface ProgressHeaderProps {
  progress: ProductionProgress;
}

/**
 * 진행 상태 정보 매핑
 */
const getStatusInfo = (status: string): ProgressStatusInfo => {
  const statusMap: Record<string, ProgressStatusInfo> = {
    PLANNED: {
      status: 'PLANNED',
      label: '계획',
      color: 'default',
    },
    ORDERED: {
      status: 'ORDERED',
      label: '지시',
      color: 'info',
    },
    IN_PROGRESS: {
      status: 'IN_PROGRESS',
      label: '진행중',
      color: 'primary',
    },
    COMPLETED: {
      status: 'COMPLETED',
      label: '완료',
      color: 'success',
    },
    PAUSED: {
      status: 'PAUSED',
      label: '중단',
      color: 'warning',
    },
    CANCELLED: {
      status: 'CANCELLED',
      label: '취소',
      color: 'error',
    },
  };

  return statusMap[status] || statusMap.PLANNED;
};

/**
 * 생산 진행 헤더 컴포넌트
 */
const ProgressHeader: React.FC<ProgressHeaderProps> = ({ progress }) => {
  const statusInfo = getStatusInfo(progress.planStatus);

  return (
    <Box sx={{ mb: 2 }}>
      {/* 계획번호와 상태 */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 1,
        }}
      >
        <Typography variant="h6" component="div" fontWeight="bold">
          {progress.planNo}
          {progress.planSeq && ` - ${progress.planSeq}`}
        </Typography>
        <Chip
          label={statusInfo.label}
          color={statusInfo.color}
          size="small"
          sx={{ fontWeight: 'bold' }}
        />
      </Box>

      {/* 품목 정보 */}
      <Box sx={{ mb: 1 }}>
        <Typography variant="body1" color="text.primary" fontWeight="medium">
          {progress.itemName}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          품목코드: {progress.itemCode}
        </Typography>
      </Box>

      {/* 거래처 정보 */}
      {progress.customerName && (
        <Typography variant="body2" color="text.secondary">
          거래처: {progress.customerName}
        </Typography>
      )}

      {/* 작업장 & 설비 정보 */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          mt: 1,
          flexWrap: 'wrap',
        }}
      >
        {progress.workplaceName && (
          <Typography variant="caption" color="text.secondary">
            🏭 {progress.workplaceName}
          </Typography>
        )}
        {progress.equipmentName && (
          <Typography variant="caption" color="text.secondary">
            ⚙️ {progress.equipmentName}
          </Typography>
        )}
        {progress.workerName && (
          <Typography variant="caption" color="text.secondary">
            👤 {progress.workerName}
          </Typography>
        )}
        {progress.shift && (
          <Chip
            label={progress.shift === 'DAY' ? '주간' : '야간'}
            size="small"
            variant="outlined"
            sx={{ height: '20px', fontSize: '0.7rem' }}
          />
        )}
      </Box>
    </Box>
  );
};

export default ProgressHeader;
