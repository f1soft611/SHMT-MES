import { ProductionPlanData } from '../types/productionPlan';

// 서비스에서 사용하는 ProductionPlan (부분 필드만 필요)
export interface ServiceProductionPlan {
  // 백엔드 필드명 (prodplanId, prodplanDate, prodplanSeq)
  prodplanId?: string;
  prodplanDate?: string;
  prodplanSeq?: number;
  // 호환성을 위한 필드명 (planNo, planDate, planSeq)
  planNo?: string;
  planDate?: string;
  planSeq?: number;
  itemCode: string;
  itemDisplayCode?: string;
  itemName: string;
  plannedQty: number;
  actualQty?: number;
  workplaceCode?: string;
  workplaceName?: string;
  processCode?: string;
  processName?: string;
  equipmentId?: string;
  equipmentCode?: string;
  equipmentName?: string;
  shift?: string; // DAY / NIGHT / 근무구분
  workerType?: string;
  workerCode?: string;
  workerName?: string;
  remark?: string;
  orderNo?: string;
  orderSeqno?: number;
  orderHistno?: number;
  lotNo?: string;
  customerCode?: string;
  customerName?: string;
  deliveryDate?: string; // 납기일 (YYYYMMDD)
  factoryCode?: string;
  useYn?: string;
  opmanCode?: string;
  optime?: string;
  opmanCode2?: string;
  optime2?: string;
}

export interface WeeklyEquipmentPlanResponse {
  equipmentPlans: Array<{
    equipmentCode: string;
    equipmentName?: string;
    weeklyPlans: { [date: string]: ServiceProductionPlan[] }; // date: YYYY-MM-DD
  }>;
}

// YYYYMMDD -> YYYY-MM-DD
const normalizeDate = (raw: string): string => {
  if (/^\d{8}$/.test(raw)) {
    return `${raw.substring(0, 4)}-${raw.substring(4, 6)}-${raw.substring(
      6,
      8
    )}`;
  }
  return raw; // 이미 변환된 경우
};

export const toProductionPlanData = (
  plan: ServiceProductionPlan,
  extras?: {
    equipmentCode?: string;
    equipmentName?: string;
    workplaceCode?: string;
    workplaceName?: string;
  }
): ProductionPlanData => {
  // 백엔드 필드명 매핑 (prodplanId -> planNo, prodplanDate -> planDate, prodplanSeq -> planSeq)
  const planNo = plan.planNo || plan.prodplanId;
  const planSeq = plan.planSeq || plan.prodplanSeq;
  const planDate = plan.planDate || plan.prodplanDate || '';

  return {
    id: `${planNo || 'NEW'}-${
      planSeq || Math.random().toString(36).slice(2, 8)
    }`,
    date:
      planDate && planDate.includes('-') ? planDate : normalizeDate(planDate),
    itemCode: plan.itemCode || '',
    itemDisplayCode: plan.itemDisplayCode || plan.itemCode || '',
    itemName: plan.itemName || '',
    plannedQty: plan.plannedQty ?? 0,
    actualQty: plan.actualQty ?? 0,
    equipmentId: plan.equipmentId,
    equipmentCode: extras?.equipmentCode || plan.equipmentCode || '',
    equipmentName: extras?.equipmentName || plan.equipmentName,
    shift: plan.shift,
    remark: plan.remark,
    orderNo: plan.orderNo,
    orderSeqno: plan.orderSeqno,
    orderHistno: plan.orderHistno,
    workplaceCode: extras?.workplaceCode || plan.workplaceCode,
    workplaceName: extras?.workplaceName || plan.workplaceName,
    processCode: plan.processCode,
    processName: plan.processName,
    workerCode: plan.workerCode,
    workerName: plan.workerName,
    customerCode: plan.customerCode,
    customerName: plan.customerName,
    deliveryDate: plan.deliveryDate
      ? plan.deliveryDate.includes('-')
        ? plan.deliveryDate
        : normalizeDate(plan.deliveryDate)
      : undefined,
    planNo: planNo,
    planSeq: planSeq,
    factoryCode: plan.factoryCode,
    lotNo: plan.lotNo,
    useYn: plan.useYn,
  };
};

export const mapWeeklyEquipmentPlans = (
  response: WeeklyEquipmentPlanResponse,
  workplaceCode?: string,
  workplaceName?: string
): ProductionPlanData[] => {
  const list: ProductionPlanData[] = [];
  response.equipmentPlans.forEach((equip) => {
    Object.entries(equip.weeklyPlans || {}).forEach(([date, dailyPlans]) => {
      dailyPlans.forEach((plan) => {
        list.push(
          toProductionPlanData(plan, {
            equipmentCode: equip.equipmentCode,
            equipmentName: equip.equipmentName,
            workplaceCode,
            workplaceName,
          })
        );
      });
    });
  });
  return list;
};
