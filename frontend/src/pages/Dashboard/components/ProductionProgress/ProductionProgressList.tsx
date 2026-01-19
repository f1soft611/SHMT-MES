import React from 'react';
import { Grid, Typography, Box, Alert } from '@mui/material';
import { ProductionProgress } from '../../../../types/dashboard';
import ProductionProgressCard from './ProductionProgressCard';

interface ProductionProgressListProps {
  progressList: ProductionProgress[];
  loading?: boolean;
  error?: string | null;
  compact?: boolean;
  title?: string;
  onSelectItem?: (progress: ProductionProgress) => void;
  selectedItem?: ProductionProgress | null;
}

/**
 * 생산 진행 현황 목록 컴포넌트
 */
const ProductionProgressList: React.FC<ProductionProgressListProps> = ({
  progressList,
  loading = false,
  error = null,
  compact = true,
  title = '생산 진행 현황',
  onSelectItem,
  selectedItem,
}) => {
  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!loading && progressList.length === 0) {
    return <Alert severity="info">진행 중인 생산계획이 없습니다.</Alert>;
  }

  return (
    <Box>
      {/* 타이틀 */}
      {title && (
        <Typography
          variant="h6"
          gutterBottom
          sx={{ mb: 2, fontWeight: 'bold' }}
        >
          {title}
        </Typography>
      )}

      {/* 진행 현황 카드 그리드 */}
      <Grid container spacing={2}>
        {progressList.map((progress) => {
          const isSelected = !!(
            selectedItem &&
            selectedItem.planNo === progress.planNo &&
            selectedItem.planSeq === progress.planSeq
          );

          return (
            <Grid
              size={{
                xs: 12,
                sm: compact ? 12 : 6,
                md: compact ? 12 : 4,
                lg: compact ? 12 : 3,
              }}
              key={`${progress.planNo}-${progress.planSeq}`}
              component="div"
            >
              <Box
                onClick={() => onSelectItem && onSelectItem(progress)}
                sx={{
                  cursor: onSelectItem ? 'pointer' : 'default',
                  transition: 'all 0.2s',
                  '&:hover': onSelectItem
                    ? {
                        transform: 'translateY(-2px)',
                      }
                    : {},
                }}
              >
                <ProductionProgressCard
                  progress={progress}
                  loading={false}
                  compact={compact}
                  selected={isSelected}
                />
              </Box>
            </Grid>
          );
        })}

        {/* 로딩 스켈레톤 */}
        {loading &&
          [1, 2, 3, 4].map((idx) => (
            <Grid
              size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
              key={`loading-${idx}`}
              component="div"
            >
              <ProductionProgressCard progress={null} loading={true} />
            </Grid>
          ))}
      </Grid>
    </Box>
  );
};

export default ProductionProgressList;
