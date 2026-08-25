import {
  mapWeeklyEquipmentPlans,
  WeeklyEquipmentPlanResponse,
  distributePlanQtyByCreateDays,
} from './productionPlanMapper';

describe('mapWeeklyEquipmentPlans', () => {
  it('같은 의뢰번호/순번/이력에 대해 서로 다른 계획일 때만 분할 순번을 계산한다', () => {
    const response: WeeklyEquipmentPlanResponse = {
      equipmentPlans: [
        {
          equipmentCode: 'EQ-01',
          equipmentName: '설비1',
          equipmentId: 'SYS-01',
          weeklyPlans: {
            '2026-05-19': [
              {
                prodplanId: 'PLAN-001',
                prodplanDate: '20260519',
                prodplanSeq: 1,
                itemCode: 'ITEM-01',
                itemName: '품목1',
                plannedQty: 250,
                orderNo: 'LRMA-24932',
                orderSeqno: 46309,
                orderHistno: 2,
              },
            ],
          },
        },
        {
          equipmentCode: 'EQ-02',
          equipmentName: '설비2',
          equipmentId: 'SYS-02',
          weeklyPlans: {
            '2026-05-20': [
              {
                prodplanId: 'PLAN-002',
                prodplanDate: '20260520',
                prodplanSeq: 1,
                itemCode: 'ITEM-01',
                itemName: '품목1',
                plannedQty: 250,
                orderNo: 'LRMA-24932',
                orderSeqno: 46309,
                orderHistno: 2,
              },
            ],
          },
        },
      ],
    };

    const result = mapWeeklyEquipmentPlans(response, 'WP001');

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      orderNo: 'LRMA-24932',
      splitByOrder: true,
      groupSeq: 1,
      totalGroupCount: 2,
    });
    expect(result[1]).toMatchObject({
      orderNo: 'LRMA-24932',
      splitByOrder: true,
      groupSeq: 2,
      totalGroupCount: 2,
    });
  });

  it('같은 의뢰라도 같은 계획이면 분할로 표시하지 않는다', () => {
    const response: WeeklyEquipmentPlanResponse = {
      equipmentPlans: [
        {
          equipmentCode: 'EQ-01',
          equipmentName: '설비1',
          equipmentId: 'SYS-01',
          weeklyPlans: {
            '2026-05-19': [
              {
                prodplanId: 'PLAN-003',
                prodplanDate: '20260519',
                prodplanSeq: 1,
                itemCode: 'ITEM-01',
                itemName: '품목1',
                plannedQty: 100,
                orderNo: 'LRMA-24933',
                orderSeqno: 46310,
                orderHistno: 2,
              },
              {
                prodplanId: 'PLAN-003',
                prodplanDate: '20260519',
                prodplanSeq: 1,
                itemCode: 'ITEM-02',
                itemName: '품목2',
                plannedQty: 150,
                orderNo: 'LRMA-24933',
                orderSeqno: 46310,
                orderHistno: 2,
              },
            ],
          },
        },
      ],
    };

    const result = mapWeeklyEquipmentPlans(response, 'WP001');

    expect(result).toHaveLength(2);
    expect(result[0].splitByOrder).toBeUndefined();
    expect(result[0].groupSeq).toBeUndefined();
    expect(result[0].totalGroupCount).toBeUndefined();
    expect(result[1].splitByOrder).toBeUndefined();
    expect(result[1].groupSeq).toBeUndefined();
    expect(result[1].totalGroupCount).toBeUndefined();
  });

  it('계획 매핑 시 비고(remark) 값이 유지된다', () => {
    const response: WeeklyEquipmentPlanResponse = {
      equipmentPlans: [
        {
          equipmentCode: 'EQ-01',
          equipmentName: '설비1',
          equipmentId: 'SYS-01',
          weeklyPlans: {
            '2026-05-19': [
              {
                prodplanId: 'PLAN-004',
                prodplanDate: '20260519',
                prodplanSeq: 1,
                itemCode: 'ITEM-03',
                itemName: '품목3',
                plannedQty: 80,
                remark: '생산의뢰 비고',
                orderNo: 'LRMA-24934',
                orderSeqno: 46311,
                orderHistno: 2,
              },
            ],
          },
        },
      ],
    };

    const result = mapWeeklyEquipmentPlans(response, 'WP001');

    expect(result).toHaveLength(1);
    expect(result[0].remark).toBe('생산의뢰 비고');
  });

  it('생성일수 분배 계산은 전체 수량을 균등하게 나누고 마지막 날에 나머지를 배정한다', () => {
    expect(distributePlanQtyByCreateDays('2026-08-01', 1200, 3)).toStrictEqual([
      { date: '2026-08-01', qty: 400 },
      { date: '2026-08-02', qty: 400 },
      { date: '2026-08-03', qty: 400 },
    ]);

    expect(distributePlanQtyByCreateDays('2026-08-01', 1000, 3)).toStrictEqual([
      { date: '2026-08-01', qty: 334 },
      { date: '2026-08-02', qty: 333 },
      { date: '2026-08-03', qty: 333 },
    ]);
  });

  it('직접품목은 동일한 directGroupId를 기준으로 묶어서 표시한다', () => {
    const response: WeeklyEquipmentPlanResponse = {
      equipmentPlans: [
        {
          equipmentCode: 'EQ-01',
          equipmentName: '설비1',
          equipmentId: 'SYS-01',
          weeklyPlans: {
            '2026-08-01': [
              {
                prodplanId: 'PLAN-DIRECT-1',
                prodplanDate: '20260801',
                prodplanSeq: 1,
                itemCode: 'ITEM-DIRECT-01',
                itemName: '직접품목1',
                plannedQty: 600,
                itemInputType: 'DIRECT',
                directGroupId: 'DG-001',
                createDays: 3,
              },
              {
                prodplanId: 'PLAN-DIRECT-2',
                prodplanDate: '20260801',
                prodplanSeq: 1,
                itemCode: 'ITEM-DIRECT-02',
                itemName: '직접품목2',
                plannedQty: 400,
                itemInputType: 'DIRECT',
                directGroupId: 'DG-001',
                createDays: 2,
              },
            ],
          },
        },
      ],
    };

    const result = mapWeeklyEquipmentPlans(response, 'WP001');

    expect(result).toHaveLength(2);
    expect(result[0].directGroupId).toBe('DG-001');
    expect(result[1].directGroupId).toBe('DG-001');
    expect(result[0].isDirectItemGroup || result[1].isDirectItemGroup).toBe(
      true,
    );
  });

  it('생성일수 3일인 직접품목은 3개 날짜로 분할 표시한다', () => {
    const response: WeeklyEquipmentPlanResponse = {
      equipmentPlans: [
        {
          equipmentCode: 'EQ-01',
          equipmentName: '설비1',
          equipmentId: 'SYS-01',
          weeklyPlans: {
            '2026-08-01': [
              {
                prodplanId: 'PLAN-DIRECT-3',
                prodplanDate: '20260801',
                prodplanSeq: 1,
                itemCode: 'ITEM-DIRECT-03',
                itemName: '직접품목3',
                plannedQty: 1200,
                itemInputType: 'DIRECT',
                directGroupId: 'DG-20260825-49098',
                createDays: 3,
              },
            ],
          },
        },
      ],
    };

    const result = mapWeeklyEquipmentPlans(response, 'WP001');

    expect(result).toHaveLength(3);
    expect(result.map((plan) => plan.date)).toStrictEqual([
      '2026-08-01',
      '2026-08-02',
      '2026-08-03',
    ]);
    expect(
      result.every((plan) => plan.directGroupId === 'DG-20260825-49098'),
    ).toBe(true);
    expect(result.map((plan) => plan.plannedQty)).toStrictEqual([
      400, 400, 400,
    ]);
    expect(result[0].isDirectItemGroup).toBe(true);
  });

  it('직접품목 메타데이터가 null이어도 생성일수와 planGroupId가 있으면 분할 표시한다', () => {
    const response: WeeklyEquipmentPlanResponse = {
      equipmentPlans: [
        {
          equipmentCode: 'EQ-01',
          equipmentName: '설비1',
          equipmentId: 'SYS-01',
          weeklyPlans: {
            '2026-08-25': [
              {
                prodplanId: 'PL202608250030',
                prodplanDate: '20260825',
                prodplanSeq: 1,
                itemCode: '49098',
                itemName: 'WRNP150-200-760(Tip16,Brown)-BL230-BA111',
                plannedQty: 1200,
                itemInputType: undefined,
                directGroupId: undefined,
                planGroupId: 'PL202608250030',
                createDays: 3,
                totalGroupCount: 3,
              },
            ],
          },
        },
      ],
    };

    const result = mapWeeklyEquipmentPlans(response, 'WP001');

    expect(result).toHaveLength(3);
    expect(result.every((plan) => plan.itemInputType === 'DIRECT')).toBe(true);
    expect(
      result.every((plan) => plan.directGroupId === 'PL202608250030'),
    ).toBe(true);
    expect(result.map((plan) => plan.plannedQty)).toStrictEqual([
      400, 400, 400,
    ]);
    expect(result[0].isDirectItemGroup).toBe(true);
  });
});
