import React from 'react';
import { Card, CardContent, Box, Alert, CircularProgress } from '@mui/material';
import { ProductionProgress } from '../../../../types/dashboard';
import ProgressHeader from './ProgressHeader';
import ProgressBar from './ProgressBar';
import ProgressStats from './ProgressStats';

interface ProductionProgressCardProps {
  progress: ProductionProgress | null;
  loading?: boolean;
  error?: string | null;
  compact?: boolean;
  selected?: boolean;
}

/**
 * 생산 진행 현황 카드 컴포넌트
 */
const ProductionProgressCard: React.FC<ProductionProgressCardProps> = ({
  progress,
  loading = false,
  error = null,
  compact = false,
  selected = false,
}) => {
  // 로딩 상태
  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: 200,
            }}
          >
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error">{error}</Alert>
        </CardContent>
      </Card>
    );
  }

  // 데이터 없음
  if (!progress) {
    return (
      <Card>
        <CardContent>
          <Alert severity="info">생산계획 정보를 선택해주세요.</Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        height: '100%',
        border: selected ? 2 : 1,
        borderColor: selected ? 'primary.main' : 'divider',
        backgroundColor: selected ? 'action.selected' : 'background.paper',
        '&:hover': {
          boxShadow: selected ? 4 : 3,
          transform: 'translateY(-2px)',
          transition: 'all 0.3s ease',
        },
      }}
    >
      <CardContent>
        {/* 헤더 영역 */}
        <ProgressHeader progress={progress} />

        {/* 진행률 바 */}
        <Box sx={{ mt: 2, mb: 2 }}>
          <ProgressBar
            value={progress.completionRate}
            label="계획 대비 실적"
            showPercentage={true}
            height={compact ? 8 : 12}
          />
        </Box>

        {/* 통계 정보 (compact 모드가 아닐 때만) */}
        {!compact && <ProgressStats progress={progress} />}

        {/* 불량 발생 경고 */}
        {progress.defectQty > 0 && progress.defectRate > 5 && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            불량률이 {progress.defectRate.toFixed(1)}%로 높습니다. 확인이
            필요합니다.
          </Alert>
        )}

        {/* 완료 메시지 */}
        {progress.completionRate >= 100 && (
          <Alert severity="success" sx={{ mt: 2 }}>
            생산계획이 완료되었습니다! 🎉
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductionProgressCard;
