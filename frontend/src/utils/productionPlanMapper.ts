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
  prodworkSeq?: number;
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
  // 생성일수/묶음 정보
  createDays?: number;
  planGroupId?: string;
  groupSeq?: number;
  totalGroupCount?: number;
  itemInputType?: 'DIRECT' | 'NORMAL';
  directGroupId?: string;
  // 생산지시 상태
  orderFlag?: string;
  // 행 단위 실적 존재 여부 (주간 조회 시 백엔드에서 반환: 1=있음, 0=없음)
  hasResult?: number;
}

export interface WeeklyEquipmentPlanResponse {
  equipmentPlans: Array<{
    equipmentCode: string;
    equipmentName?: string;
    equipmentId?: string;
    processCode?: string;
    processName?: string;
    weeklyPlans: { [date: string]: ServiceProductionPlan[] }; // date: YYYY-MM-DD
  }>;
}

// YYYYMMDD -> YYYY-MM-DD
const normalizeDate = (raw: string): string => {
  if (/^\d{8}$/.test(raw)) {
    return `${raw.substring(0, 4)}-${raw.substring(4, 6)}-${raw.substring(
      6,
      8,
    )}`;
  }
  return raw; // 이미 변환된 경우
};

const normalizeOrderFlag = (
  orderFlag?: string,
): ProductionPlanData['orderFlag'] => {
  const normalized = orderFlag?.toUpperCase();
  if (
    normalized === 'PLANNED' ||
    normalized === 'ORDERED' ||
    normalized === 'STOPPED'
  ) {
    return normalized;
  }
  return undefined;
};

export const distributePlanQtyByCreateDays = (
  planDate: string,
  totalQty: number,
  createDays: number,
): Array<{ date: string; qty: number }> => {
  const safeDays = Math.max(1, Number(createDays) || 1);
  const safeQty = Number(totalQty) || 0;
  const baseQty = Math.floor(safeQty / safeDays);
  const remainder = safeQty % safeDays;
  const baseDate = planDate.includes('-') ? planDate : normalizeDate(planDate);

  return Array.from({ length: safeDays }, (_, index) => {
    const currentDate = new Date(baseDate);
    currentDate.setDate(currentDate.getDate() + index);
    const qty = index === 0 ? baseQty + remainder : baseQty;

    return {
      date: currentDate.toISOString().slice(0, 10),
      qty,
    };
  });
};

export const toProductionPlanData = (
  plan: ServiceProductionPlan,
  extras?: {
    equipmentId?: string;
    equipmentCode?: string;
    equipmentName?: string;
    workplaceCode?: string;
    workplaceName?: string;
  },
): ProductionPlanData => {
  // 백엔드 필드명 매핑 (prodplanId -> planNo, prodplanDate -> planDate, prodplanSeq -> planSeq)
  const planNo = plan.planNo || plan.prodplanId;
  const planSeq = plan.planSeq || plan.prodplanSeq;
  const planDate = plan.planDate || plan.prodplanDate || '';
  const createDays = Number(plan.createDays ?? 1) || 1;
  const rawItemInputType =
    (plan as any).itemInputType ?? (plan as any).ITEM_INPUT_TYPE ?? undefined;
  const normalizedItemInputType = rawItemInputType
    ? String(rawItemInputType).trim().toUpperCase()
    : '';
  const rawDirectGroupId =
    (plan as any).directGroupId ?? (plan as any).DIRECT_GROUP_ID ?? undefined;
  const legacyPlanGroupId =
    plan.planGroupId || (plan as any).PLAN_GROUP_ID || undefined;
  const hasLegacyDirectMeta =
    createDays > 1 &&
    !!legacyPlanGroupId &&
    (!normalizedItemInputType || normalizedItemInputType === 'NORMAL');
  const normalizedDirectGroupId =
    rawDirectGroupId != null && String(rawDirectGroupId).trim() !== ''
      ? String(rawDirectGroupId).trim()
      : hasLegacyDirectMeta && legacyPlanGroupId
        ? String(legacyPlanGroupId).trim()
        : undefined;
  const derivedItemInputType =
    normalizedItemInputType === 'DIRECT'
      ? 'DIRECT'
      : normalizedItemInputType === 'NORMAL'
        ? hasLegacyDirectMeta
          ? 'DIRECT'
          : 'NORMAL'
        : hasLegacyDirectMeta
          ? 'DIRECT'
          : 'NORMAL';

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
    equipmentId: extras?.equipmentId || plan.equipmentId,
    equipmentCode: extras?.equipmentCode || plan.equipmentCode || '',
    equipmentName: extras?.equipmentName || plan.equipmentName,
    shift: plan.shift ?? undefined,
    remark: plan.remark ?? undefined,
    itemInputType: derivedItemInputType,
    directGroupId: normalizedDirectGroupId,
    displayQtyByDate:
      createDays > 1 && plan.plannedQty != null
        ? distributePlanQtyByCreateDays(
            planDate || new Date().toISOString().slice(0, 10),
            Number(plan.plannedQty),
            createDays,
          )
        : undefined,
    orderNo: plan.orderNo ?? undefined,
    orderSeqno: plan.orderSeqno ?? undefined,
    orderHistno: plan.orderHistno ?? undefined,
    workplaceCode: (extras?.workplaceCode || plan.workplaceCode) ?? undefined,
    workplaceName: (extras?.workplaceName || plan.workplaceName) ?? undefined,
    processCode: plan.processCode ?? undefined,
    processName: plan.processName ?? undefined,
    workerCode: plan.workerCode ?? undefined,
    workerName: plan.workerName ?? undefined,
    customerCode: plan.customerCode ?? undefined,
    customerName: plan.customerName ?? undefined,
    deliveryDate: plan.deliveryDate
      ? plan.deliveryDate.includes('-')
        ? plan.deliveryDate
        : normalizeDate(plan.deliveryDate)
      : undefined,
    planNo: planNo ?? undefined,
    planSeq: planSeq ?? undefined,
    prodworkSeq: plan.prodworkSeq ?? undefined,
    factoryCode: plan.factoryCode ?? undefined,
    lotNo: plan.lotNo ?? undefined,
    useYn: plan.useYn ?? undefined,
    createDays: plan.createDays,
    planGroupId: plan.planGroupId,
    groupSeq: plan.groupSeq,
    totalGroupCount: plan.totalGroupCount,
    orderFlag: normalizeOrderFlag(plan.orderFlag),
    hasResult: plan.hasResult != null ? Number(plan.hasResult) : 0,
  };
};

export const mapWeeklyEquipmentPlans = (
  response: WeeklyEquipmentPlanResponse,
  workplaceCode?: string,
  workplaceName?: string,
): ProductionPlanData[] => {
  const list: ProductionPlanData[] = [];
  response.equipmentPlans.forEach((equip) => {
    Object.entries(equip.weeklyPlans || {}).forEach(([date, dailyPlans]) => {
      dailyPlans.forEach((plan) => {
        list.push(
          toProductionPlanData(plan, {
            equipmentId: equip.equipmentId,
            equipmentCode: equip.equipmentCode,
            equipmentName: equip.equipmentName,
            workplaceCode,
            workplaceName,
          }),
        );
      });
    });
  });

  type GroupCandidate = {
    index: number;
    planKey: string;
  };

  const groupedIndexes = new Map<string, GroupCandidate[]>();

  list.forEach((plan, index) => {
    const hasExistingGroup =
      !!plan.planGroupId && (plan.totalGroupCount ?? plan.createDays ?? 1) > 1;

    if (
      hasExistingGroup ||
      !plan.orderNo ||
      plan.orderSeqno == null ||
      plan.orderHistno == null
    ) {
      return;
    }

    const planNo = plan.planNo || 'NO_PLAN';
    const planSeq = plan.planSeq ?? -1;
    const orderKey = `${plan.orderNo}::${plan.orderSeqno}::${plan.orderHistno}`;
    const planKey = `${planNo}::${planSeq}`;

    const candidates = groupedIndexes.get(orderKey) ?? [];
    candidates.push({ index, planKey });
    groupedIndexes.set(orderKey, candidates);
  });

  groupedIndexes.forEach((candidates) => {
    if (candidates.length < 2) {
      return;
    }

    const distinctPlanCount = new Set(candidates.map((item) => item.planKey))
      .size;
    if (distinctPlanCount < 2) {
      return;
    }

    const indexes = candidates.map((item) => item.index);

    indexes.forEach((index, orderIndex) => {
      list[index] = {
        ...list[index],
        splitByOrder: true,
        groupSeq: orderIndex + 1,
        totalGroupCount: indexes.length,
      };
    });
  });

  const directGroupCounts = new Map<string, number>();
  list.forEach((plan) => {
    if (plan.itemInputType === 'DIRECT' && plan.directGroupId) {
      const count = directGroupCounts.get(plan.directGroupId) ?? 0;
      directGroupCounts.set(plan.directGroupId, count + 1);
    }
  });

  const expandedDirectPlans: ProductionPlanData[] = [];

  list.forEach((plan) => {
    const createDays = Number(plan.createDays ?? 1) || 1;
    const directGroupCount =
      plan.itemInputType === 'DIRECT' && plan.directGroupId
        ? (directGroupCounts.get(plan.directGroupId) ?? 1)
        : 1;
    const isSingleDirectPlan =
      plan.itemInputType === 'DIRECT' &&
      !!plan.directGroupId &&
      createDays > 1 &&
      directGroupCount === 1;

    if (!isSingleDirectPlan) {
      expandedDirectPlans.push(plan);
      return;
    }

    const distributed = distributePlanQtyByCreateDays(
      plan.date || new Date().toISOString().slice(0, 10),
      Number(plan.plannedQty ?? 0),
      createDays,
    );

    distributed.forEach((segment, index) => {
      expandedDirectPlans.push({
        ...plan,
        date: segment.date,
        plannedQty: segment.qty,
        isDirectItemGroup: true,
        directGroupId: plan.directGroupId,
        groupSeq: index + 1,
        totalGroupCount: createDays,
        displayQtyByDate: distributed,
      });
    });
  });

  const directList = expandedDirectPlans.filter(
    (plan) => !!plan.directGroupId && plan.itemInputType === 'DIRECT',
  );

  const groupedDirectIndexes = new Map<string, number[]>();
  directList.forEach((plan, index) => {
    if (!plan.directGroupId) {
      return;
    }

    const existing = groupedDirectIndexes.get(plan.directGroupId) ?? [];
    existing.push(index);
    groupedDirectIndexes.set(plan.directGroupId, existing);
  });

  groupedDirectIndexes.forEach((indexes, directGroupId) => {
    if (indexes.length < 2) {
      indexes.forEach((index) => {
        expandedDirectPlans[index] = {
          ...expandedDirectPlans[index],
          directGroupId,
          isDirectItemGroup: true,
          groupSeq: 1,
          totalGroupCount: 1,
        };
      });
      return;
    }

    indexes.forEach((index, groupIndex) => {
      expandedDirectPlans[index] = {
        ...expandedDirectPlans[index],
        directGroupId,
        isDirectItemGroup: true,
        groupSeq: groupIndex + 1,
        totalGroupCount: indexes.length,
      };
    });
  });

  return expandedDirectPlans;
};
