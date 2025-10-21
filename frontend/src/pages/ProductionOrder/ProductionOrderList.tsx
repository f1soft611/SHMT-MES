import React, { useEffect, useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import Alert from '@mui/material/Alert';
import TablePagination from '@mui/material/TablePagination';
import { styled } from '@mui/material/styles';
import { format } from 'date-fns';

import { productionOrderService } from '../../services/productionOrderService';
import { ProductionOrder } from '../../types';
import SearchFiltersComponent, {
  SearchFilters,
} from '../../components/common/SearchFilters/SearchFilters';
import SkeletonTable from '../../components/common/SkeletonUI/SkeletonTable';
import { useUrlState } from '../../hooks/useUrlState';

const ProductionOrderCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  transition: 'box-shadow 0.2s ease-in-out',
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
}));

const StatusChip = styled(Chip)(({ theme }) => ({
  minWidth: 80,
  height: 24,
  fontSize: '0.75rem',
  fontWeight: 600,
}));

const ProgressContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  marginTop: 8,
});

const OrderHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: theme.spacing(1),
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    gap: theme.spacing(1),
  },
}));

const OrderInfo = styled(Box)({
  flex: 1,
});

const OrderMeta = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  gap: theme.spacing(0.5),
  [theme.breakpoints.down('md')]: {
    alignItems: 'flex-start',
    width: '100%',
  },
}));

const ProductionOrderList: React.FC = () => {
  const [productionOrders, setProductionOrders] = useState<ProductionOrder[]>(
    []
  );
  const [pagination, setPagination] = useState({
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 20,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // URL state management
  const {
    state: urlState,
    updateUrlState,
    resetUrlState,
  } = useUrlState({
    page: 0,
    pageSize: 20,
  });

  // Search filters state
  const [filters, setFilters] = useState<SearchFilters>({
    dateFrom: urlState.dateFrom,
    dateTo: urlState.dateTo,
    keyword: urlState.keyword,
  });

  // Combined search parameters
  const searchParams = useMemo(
    () => ({
      page: urlState.page,
      pageSize: urlState.pageSize,
      ...filters,
    }),
    [urlState.page, urlState.pageSize, filters]
  );

  // Fetch production orders
  const fetchProductionOrders = async (params = searchParams) => {
    try {
      setLoading(true);
      setError(null);

      const response = await productionOrderService.getProductionOrders(
        params.page,
        params.pageSize,
        undefined, // status filter can be added later
        params.dateFrom,
        params.dateTo,
        params.keyword
      );

      setProductionOrders(response.content || []);
      setPagination({
        totalElements: response.totalElements || 0,
        totalPages: response.totalPages || 0,
        currentPage: response.number || 0,
        pageSize: response.size || params.pageSize,
      });
    } catch (error: any) {
      console.error('Error fetching production orders:', error);
      setError(error.message || '생산지시 목록을 불러오는데 실패했습니다.');
      setProductionOrders([]);
      setPagination({
        totalElements: 0,
        totalPages: 0,
        currentPage: 0,
        pageSize: params.pageSize,
      });
    } finally {
      setLoading(false);
    }
  };

  // Effect to fetch data when search parameters change
  useEffect(() => {
    fetchProductionOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Handlers
  const handlePageChange = (event: unknown, newPage: number) => {
    updateUrlState({ page: newPage });
  };

  const handleRowsPerPageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    updateUrlState({ page: 0, pageSize: parseInt(event.target.value, 10) });
  };

  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
  };

  const handleSearch = () => {
    updateUrlState({
      page: 0,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      keyword: filters.keyword,
    });
  };

  const handleReset = () => {
    setFilters({});
    resetUrlState();
  };

  // Helper functions
  const getStatusColor = (status: ProductionOrder['status']) => {
    switch (status) {
      case 'COMPLETED':
        return 'success';
      case 'IN_PROGRESS':
        return 'primary';
      case 'PENDING':
        return 'warning';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: ProductionOrder['status']) => {
    switch (status) {
      case 'COMPLETED':
        return '완료';
      case 'IN_PROGRESS':
        return '진행중';
      case 'PENDING':
        return '대기';
      case 'CANCELLED':
        return '취소';
      default:
        return status;
    }
  };

  const calculateProgress = (order: ProductionOrder) => {
    // This is a mock calculation - in real implementation, this would come from the API
    switch (order.status) {
      case 'COMPLETED':
        return 100;
      case 'IN_PROGRESS':
        return Math.floor(Math.random() * 80) + 15; // 15-95%
      case 'PENDING':
        return 0;
      case 'CANCELLED':
        return 0;
      default:
        return 0;
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'yyyy-MM-dd');
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
          <Typography variant="h5">생산지시목록</Typography>
        </Box>
      </Box>

      {/* Search Filters */}
      <SearchFiltersComponent
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onSearch={handleSearch}
        onReset={handleReset}
        loading={loading}
      />

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <SkeletonTable rows={pagination.pageSize} showHeader={false} />
      )}

      {/* Data List */}
      {!loading && (
        <>
          {productionOrders.length === 0 ? (
            <Box
              sx={{
                textAlign: 'center',
                py: 8,
                color: 'text.secondary',
              }}
            >
              <Typography variant="h6" gutterBottom>
                생산지시가 없습니다
              </Typography>
              <Typography variant="body2">
                검색 조건을 변경하거나 새로운 생산지시를 등록해주세요.
              </Typography>
            </Box>
          ) : (
            <>
              {productionOrders.map((order) => {
                const progress = calculateProgress(order);
                return (
                  <ProductionOrderCard key={order.id} elevation={1}>
                    <CardContent>
                      <OrderHeader>
                        <OrderInfo>
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: 600, mb: 0.5 }}
                          >
                            {order.orderNumber}
                          </Typography>
                          <Typography variant="body1" sx={{ mb: 0.5 }}>
                            {order.productName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            제품코드: {order.productCode} | 수량:{' '}
                            {order.quantity.toLocaleString()}
                            {order.unit}
                          </Typography>
                        </OrderInfo>

                        <OrderMeta>
                          <StatusChip
                            label={getStatusLabel(order.status)}
                            color={getStatusColor(order.status) as any}
                            variant="filled"
                          />
                          <Typography variant="caption" color="text.secondary">
                            납기일: {formatDate(order.dueDate)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            등록일: {formatDate(order.createdAt)}
                          </Typography>
                        </OrderMeta>
                      </OrderHeader>

                      {/* Progress Bar for In-Progress Orders */}
                      {order.status === 'IN_PROGRESS' && (
                        <ProgressContainer>
                          <LinearProgress
                            variant="determinate"
                            value={progress}
                            sx={{
                              flexGrow: 1,
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: 'grey.200',
                            }}
                            color="primary"
                          />
                          <Typography
                            variant="caption"
                            sx={{ minWidth: 35, fontWeight: 600 }}
                          >
                            {progress}%
                          </Typography>
                        </ProgressContainer>
                      )}
                    </CardContent>
                  </ProductionOrderCard>
                );
              })}

              {/* MUI TablePagination */}
              <TablePagination
                component="div"
                count={pagination.totalElements}
                page={pagination.currentPage}
                onPageChange={handlePageChange}
                rowsPerPage={pagination.pageSize}
                onRowsPerPageChange={handleRowsPerPageChange}
                rowsPerPageOptions={[10, 20, 50, 100]}
                labelRowsPerPage="페이지당 행 수:"
                labelDisplayedRows={({ from, to, count }) =>
                  `${from}-${to} of ${count !== -1 ? count : `more than ${to}`}`
                }
              />
            </>
          )}
        </>
      )}
    </Box>
  );
};

export default ProductionOrderList;
