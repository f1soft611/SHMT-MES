import React from 'react';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { styled } from '@mui/material/styles';

interface SkeletonTableProps {
  rows?: number;
  showHeader?: boolean;
}

const SkeletonCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
}));

const SkeletonRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(1),
  '&:last-child': {
    marginBottom: 0,
  },
}));

const SkeletonTable: React.FC<SkeletonTableProps> = ({ 
  rows = 5, 
  showHeader = true 
}) => {
  return (
    <Box>
      {/* Header Skeleton */}
      {showHeader && (
        <Box sx={{ mb: 2 }}>
          <Skeleton variant="text" height={32} width="60%" sx={{ mb: 1 }} />
          <Skeleton variant="text" height={20} width="40%" />
        </Box>
      )}

      {/* Table Rows Skeleton */}
      {Array.from({ length: rows }).map((_, index) => (
        <SkeletonCard key={index} elevation={1}>
          <CardContent sx={{ py: 2 }}>
            <SkeletonRow>
              {/* Left side - Main info */}
              <Box sx={{ flex: 1, pr: 2 }}>
                <Skeleton variant="text" height={24} width="70%" sx={{ mb: 0.5 }} />
                <Skeleton variant="text" height={20} width="85%" sx={{ mb: 0.5 }} />
                <Skeleton variant="text" height={18} width="60%" />
              </Box>

              {/* Right side - Status and date */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                <Skeleton variant="rectangular" height={24} width={80} sx={{ borderRadius: 1 }} />
                <Skeleton variant="text" height={18} width={100} />
                <Skeleton variant="text" height={16} width={60} />
              </Box>
            </SkeletonRow>

            {/* Progress bar skeleton */}
            <Box sx={{ mt: 1 }}>
              <Skeleton variant="rectangular" height={6} width="100%" sx={{ borderRadius: 3 }} />
            </Box>
          </CardContent>
        </SkeletonCard>
      ))}

      {/* Pagination Skeleton */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mt: 3, 
        p: 2,
        borderTop: 1,
        borderColor: 'divider'
      }}>
        <Box>
          <Skeleton variant="text" height={20} width={200} sx={{ mb: 1 }} />
          <Skeleton variant="rectangular" height={32} width={120} />
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton variant="rectangular" width={32} height={32} />
          <Skeleton variant="rectangular" width={32} height={32} />
          <Skeleton variant="rectangular" width={32} height={32} />
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton variant="circular" width={32} height={32} />
        </Box>
      </Box>
    </Box>
  );
};

export default SkeletonTable;