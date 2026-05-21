import { renderHook, act } from '@testing-library/react';
import { useStopWorkDialog } from './useStopWorkDialog';
import { ProdPlanRow } from '../../../types/productionOrder';

const makeRow = (prodQty: number): ProdPlanRow => ({
  orderFlag: 'ORDERED',
  orderGubun: '',
  orderGubunFlag: 0,
  factoryCode: 'F1',
  prodplanDate: '20260521',
  prodplanSeq: 1,
  prodworkSeq: 1,
  prodplanId: 'P1',
  prodplanDetailId: 'D1',
  itemCodeId: 'I1',
  itemCode: 'ITEM',
  itemName: '테스트품목',
  workcenterCode: 'WC1',
  workcenterName: '작업장A',
  workCode: 'W1',
  equipSysCd: 'E1',
  prodQty,
  erpIfInserted: false,
});

describe('useStopWorkDialog', () => {
  it('handleOpen이 호출되면 open이 true가 된다', () => {
    const { result } = renderHook(() =>
      useStopWorkDialog([makeRow(100)])
    );
    act(() => result.current.handleOpen());
    expect(result.current.open).toBe(true);
  });

  it('handleOpen 시 orderQty가 selectedRows[0].prodQty로 초기화된다', () => {
    const { result } = renderHook(() =>
      useStopWorkDialog([makeRow(250)])
    );
    act(() => result.current.handleOpen());
    expect(result.current.orderQty).toBe(250);
  });

  it('handleClose가 호출되면 open이 false가 된다', () => {
    const { result } = renderHook(() =>
      useStopWorkDialog([makeRow(100)])
    );
    act(() => result.current.handleOpen());
    act(() => result.current.handleClose());
    expect(result.current.open).toBe(false);
  });

  it('setOrderQty로 값을 변경할 수 있다', () => {
    const { result } = renderHook(() =>
      useStopWorkDialog([makeRow(100)])
    );
    act(() => result.current.handleOpen());
    act(() => result.current.setOrderQty(999));
    expect(result.current.orderQty).toBe(999);
  });

  it('selectedRows가 비어있으면 handleOpen 시 orderQty가 0으로 초기화된다', () => {
    const { result } = renderHook(() => useStopWorkDialog([]));
    act(() => result.current.handleOpen());
    expect(result.current.orderQty).toBe(0);
  });
});
