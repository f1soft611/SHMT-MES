import {
  mapWeeklyEquipmentPlans,
  WeeklyEquipmentPlanResponse,
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
});
