// 생산지시 관련 타입
export interface ProductionOrder {
  id: string;
  orderNumber: string;
  productCode: string;
  productName: string;
  quantity: number;
  unit: string;
  dueDate: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

// 생산실적 관련 타입
export interface ProductionResult {
  id: string;
  orderId: string;
  orderNumber: string;
  productCode: string;
  productName: string;
  plannedQuantity: number;
  actualQuantity: number;
  defectQuantity: number;
  goodQuantity: number;
  workStartTime: string;
  workEndTime: string;
  operator: string;
  status: 'IN_PROGRESS' | 'COMPLETED';
  createdAt: string;
  updatedAt: string;
}

// 인터페이스 관련 타입
export interface InterfaceLog {
  id: string;
  type: 'PRODUCTION_ORDER' | 'PRODUCTION_RESULT';
  direction: 'INBOUND' | 'OUTBOUND';
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  message: string;
  timestamp: string;
}

// API 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

// 페이지네이션 타입
export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}