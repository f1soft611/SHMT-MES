import { ProductionPlanData } from '../types/productionPlan';

// 서비스에서 사용하는 ProductionPlan (부분 필드만 필요)
export interface ServiceProductionPlan {
  planNo?: string;
  planSeq?: number;
  planDate: string; // YYYYMMDD
  itemCode: string;
  itemName: string;
  plannedQty: number;
  equipmentCode: string;
  equipmentName?: string;
  shift?: string;
  remark?: string;
  orderNo?: string;
  orderSeqno?: number;
  orderHistno?: number;
  workerCode?: string;
  workerName?: string;
  customerCode?: string;
  customerName?: string;
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
  extras: {
    equipmentCode: string;
    equipmentName?: string;
    workplaceCode?: string;
  }
): ProductionPlanData => {
  return {
    id: `${plan.planNo || 'NEW'}-${
      plan.planSeq || Math.random().toString(36).slice(2, 8)
    }`,
    date: plan.planDate.includes('-')
      ? plan.planDate
      : normalizeDate(plan.planDate),
    itemCode: plan.itemCode,
    itemName: plan.itemName,
    plannedQty: plan.plannedQty,
    equipmentCode: extras.equipmentCode,
    equipmentName: extras.equipmentName || plan.equipmentName,
    shift: plan.shift,
    remark: plan.remark,
    orderNo: plan.orderNo,
    orderSeqno: plan.orderSeqno,
    orderHistno: plan.orderHistno,
    workplaceCode: extras.workplaceCode,
    workerCode: plan.workerCode,
    workerName: plan.workerName,
    customerCode: plan.customerCode,
    customerName: plan.customerName,
    planNo: plan.planNo,
    planSeq: plan.planSeq,
  };
};

export const mapWeeklyEquipmentPlans = (
  response: WeeklyEquipmentPlanResponse,
  workplaceCode?: string
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
          })
        );
      });
    });
  });
  return list;
};
