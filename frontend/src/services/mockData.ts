import { ProductionOrder, PaginatedResponse } from '../types';

// Mock data for development/demo purposes
const mockProductionOrders: ProductionOrder[] = [
  {
    id: 'PO001',
    orderNumber: 'PRB-2025-0722-001',
    productCode: 'WRNP-150-175-640',
    productName: 'WRNP 150-175-640 프로브',
    quantity: 5000,
    unit: '개',
    dueDate: '2025-07-23T00:00:00Z',
    status: 'IN_PROGRESS',
    createdAt: '2025-07-22T05:30:00Z',
    updatedAt: '2025-07-22T05:30:00Z',
  },
  {
    id: 'PO002',
    orderNumber: 'PRB-2025-0722-002',
    productCode: 'VRNP-200-250-800',
    productName: 'VRNP 200-250-800 프로브',
    quantity: 3000,
    unit: '개',
    dueDate: '2025-07-24T00:00:00Z',
    status: 'PENDING',
    createdAt: '2025-07-22T04:15:00Z',
    updatedAt: '2025-07-22T04:15:00Z',
  },
  {
    id: 'PO003',
    orderNumber: 'PRB-2025-0721-003',
    productCode: 'CRNP-120-150-600',
    productName: 'CRNP 120-150-600 프로브',
    quantity: 2500,
    unit: '개',
    dueDate: '2025-07-22T00:00:00Z',
    status: 'COMPLETED',
    createdAt: '2025-07-21T16:20:00Z',
    updatedAt: '2025-07-21T23:45:00Z',
  },
  {
    id: 'PO004',
    orderNumber: 'PRB-2025-0722-004',
    productCode: 'WRNP-100-125-500',
    productName: 'WRNP 100-125-500 프로브',
    quantity: 4000,
    unit: '개',
    dueDate: '2025-07-25T00:00:00Z',
    status: 'IN_PROGRESS',
    createdAt: '2025-07-22T03:45:00Z',
    updatedAt: '2025-07-22T03:45:00Z',
  },
  {
    id: 'PO005',
    orderNumber: 'PRB-2025-0720-005',
    productCode: 'VRNP-300-350-1000',
    productName: 'VRNP 300-350-1000 프로브',
    quantity: 1500,
    unit: '개',
    dueDate: '2025-07-22T00:00:00Z',
    status: 'IN_PROGRESS',
    createdAt: '2025-07-20T14:30:00Z',
    updatedAt: '2025-07-20T14:30:00Z',
  },
  {
    id: 'PO006',
    orderNumber: 'PRB-2025-0719-006',
    productCode: 'WRNP-80-100-400',
    productName: 'WRNP 80-100-400 프로브',
    quantity: 3500,
    unit: '개',
    dueDate: '2025-07-21T00:00:00Z',
    status: 'COMPLETED',
    createdAt: '2025-07-19T10:00:00Z',
    updatedAt: '2025-07-21T18:30:00Z',
  },
  {
    id: 'PO007',
    orderNumber: 'PRB-2025-0718-007',
    productCode: 'CRNP-90-110-450',
    productName: 'CRNP 90-110-450 프로브',
    quantity: 2200,
    unit: '개',
    dueDate: '2025-07-20T00:00:00Z',
    status: 'COMPLETED',
    createdAt: '2025-07-18T08:15:00Z',
    updatedAt: '2025-07-20T22:15:00Z',
  },
  {
    id: 'PO008',
    orderNumber: 'PRB-2025-0722-008',
    productCode: 'VRNP-250-300-900',
    productName: 'VRNP 250-300-900 프로브',
    quantity: 6000,
    unit: '개',
    dueDate: '2025-07-26T00:00:00Z',
    status: 'PENDING',
    createdAt: '2025-07-22T07:00:00Z',
    updatedAt: '2025-07-22T07:00:00Z',
  },
  {
    id: 'PO009',
    orderNumber: 'PRB-2025-0721-009',
    productCode: 'WRNP-180-200-720',
    productName: 'WRNP 180-200-720 프로브',
    quantity: 4500,
    unit: '개',
    dueDate: '2025-07-24T00:00:00Z',
    status: 'IN_PROGRESS',
    createdAt: '2025-07-21T11:30:00Z',
    updatedAt: '2025-07-21T11:30:00Z',
  },
  {
    id: 'PO010',
    orderNumber: 'PRB-2025-0720-010',
    productCode: 'CRNP-160-190-750',
    productName: 'CRNP 160-190-750 프로브',
    quantity: 2800,
    unit: '개',
    dueDate: '2025-07-23T00:00:00Z',
    status: 'CANCELLED',
    createdAt: '2025-07-20T09:15:00Z',
    updatedAt: '2025-07-22T08:00:00Z',
  },
];

export const getMockProductionOrders = (
  page: number = 0,
  size: number = 20,
  dateFrom?: string,
  dateTo?: string,
  keyword?: string
): PaginatedResponse<ProductionOrder> => {
  let filteredOrders = [...mockProductionOrders];

  // Filter by date range
  if (dateFrom || dateTo) {
    filteredOrders = filteredOrders.filter(order => {
      const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
      const matchesFrom = !dateFrom || orderDate >= dateFrom;
      const matchesTo = !dateTo || orderDate <= dateTo;
      return matchesFrom && matchesTo;
    });
  }

  // Filter by keyword
  if (keyword) {
    const searchTerm = keyword.toLowerCase();
    filteredOrders = filteredOrders.filter(order =>
      order.orderNumber.toLowerCase().includes(searchTerm) ||
      order.productName.toLowerCase().includes(searchTerm) ||
      order.productCode.toLowerCase().includes(searchTerm)
    );
  }

  // Pagination
  const startIndex = page * size;
  const endIndex = startIndex + size;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  return {
    content: paginatedOrders,
    totalElements: filteredOrders.length,
    totalPages: Math.ceil(filteredOrders.length / size),
    size: size,
    number: page,
  };
};