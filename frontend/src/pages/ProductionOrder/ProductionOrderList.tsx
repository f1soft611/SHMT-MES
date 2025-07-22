import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { productionOrderService } from '../../services/productionOrderService';

interface ProductionOrder {
  // 생산지시 데이터 타입 정의
  id: string;
  orderNumber: string;
  productName: string;
  quantity: number;
  // 필요한 필드들 추가
}

const ProductionOrderList: React.FC = () => {
  const [productionOrders, setProductionOrders] = useState<ProductionOrder[]>(
    []
  );
  const [pagination, setPagination] = useState({
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProductionOrders = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await productionOrderService.getProductionOrders(
          0,
          20
        );

        // 안전한 데이터 접근
        setProductionOrders(response.content || []);
        setPagination({
          totalElements: response.totalElements || 0,
          totalPages: response.totalPages || 0,
          currentPage: response.number || 0,
        });
      } catch (error: any) {
        console.error('Error fetching production orders:', error);
        setError(error.message || '생산지시 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchProductionOrders();
  }, []);

  if (loading) {
    return (
      <Box>
        <Typography>로딩 중...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        생산지시 목록
      </Typography>
      {productionOrders.length === 0 ? (
        <Typography variant="body1">생산지시가 없습니다.</Typography>
      ) : (
        <Box>
          {productionOrders.map((order) => (
            <Box key={order.id} sx={{ mb: 1, p: 1, border: '1px solid #ccc' }}>
              <Typography variant="body1">
                주문번호: {order.orderNumber} | 제품명: {order.productName} |
                수량: {order.quantity}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default ProductionOrderList;
