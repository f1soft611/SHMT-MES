import api from './api';

export interface ProductionPlan {
  factoryCode?: string;
  planNo?: string;
  planSeq?: number;
  planDate: string;
  itemCode: string;
  itemName: string;
  plannedQty: number;
  actualQty?: number;
  workplaceCode: string;
  workplaceName?: string;
  processCode?: string;
  processName?: string;
  equipmentId?: string;
  equipmentCode: string;
  equipmentName?: string;
  workerType?: string;
  workerCode?: string;
  workerName?: string;
  orderNo?: string;
  orderSeqno?: number;
  orderHistno?: number;
  lotNo?: string;
  customerCode?: string;
  customerName?: string;
  deliveryDate?: string; // 납기일 (YYYYMMDD)
  remark?: string;
  useYn?: string;
  opmanCode?: string;
  optime?: string;
  opmanCode2?: string;
  optime2?: string;
}

export interface ProductionPlanMaster {
  factoryCode?: string;
  planNo?: string;
  planDate: string;
  workplaceCode: string;
  workplaceName?: string;
  planStatus?: string;
  totalPlanQty?: number;
  remark?: string;
  useYn?: string;
}

export interface ProductionPlanRequest {
  master: ProductionPlanMaster;
  details: ProductionPlan[];
  references?: any[];
}

const productionPlanService = {
  getProductionPlans: async (params: any) => {
    const response = await api.get('/api/production-plans', { params });
    return response.data;
  },

  getProductionPlanDetail: async (planNo: string) => {
    const response = await api.get(`/api/production-plans/${planNo}`);
    return response.data;
  },

  createProductionPlan: async (data: ProductionPlanRequest) => {
    const response = await api.post('/api/production-plans', data);
    return response.data;
  },

  updateProductionPlan: async (planNo: string, data: ProductionPlanRequest) => {
    const response = await api.put(`/api/production-plans/${planNo}`, data);
    return response.data;
  },

  deleteProductionPlan: async (planNo: string) => {
    const response = await api.delete(`/api/production-plans/${planNo}`);
    return response.data;
  },

  // 주간 생산계획 조회 (설비별 그룹화)
  getWeeklyProductionPlans: async (params: {
    workplaceCode: string;
    startDate: string;
    endDate: string;
  }) => {
    const response = await api.get('/api/production-plans/weekly', { params });
    return response.data;
  },
};

export default productionPlanService;
