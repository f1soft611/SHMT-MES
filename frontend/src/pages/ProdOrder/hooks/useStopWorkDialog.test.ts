import { renderHook, act, waitFor } from '@testing-library/react';
import { useStopWorkDialog } from './useStopWorkDialog';
import { ProdPlanRow } from '../../../types/productionOrder';
import { productionOrderService } from '../../../services/productionOrderService';

jest.mock('../../../services/productionOrderService', () => ({
  productionOrderService: {
    stopWork: jest.fn(),
  },
}));
jest.mock('../../../components/common/Feedback/ToastProvider', () => ({
  useToast: () => ({ showToast: jest.fn() }),
}));

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
  orderQty: prodQty,
  erpProcYn: '',
  erpStatus: '',
  erpResult:'',
  workSeq:0,
});

const mockClear = jest.fn();
const mockReload = jest.fn();

describe('useStopWorkDialog', () => {
  beforeEach(() => jest.clearAllMocks());

  it('handleOpen이 호출되면 open이 true가 된다', () => {
    const { result } = renderHook(() =>
        useStopWorkDialog([makeRow(100)], mockClear, mockReload)
    );
    act(() => result.current.handleOpen());
    expect(result.current.open).toBe(true);
  });

  it('handleOpen 시 orderQty가 selectedRows[0].prodQty로 초기화된다', () => {
    const { result } = renderHook(() =>
        useStopWorkDialog([makeRow(250)], mockClear, mockReload)
    );
    act(() => result.current.handleOpen());
    expect(result.current.orderQty).toBe(250);
  });

  it('handleClose가 호출되면 open이 false가 된다', () => {
    const { result } = renderHook(() =>
        useStopWorkDialog([makeRow(100)], mockClear, mockReload)
    );
    act(() => result.current.handleOpen());
    act(() => result.current.handleClose());
    expect(result.current.open).toBe(false);
  });

  it('setOrderQty로 값을 변경할 수 있다', () => {
    const { result } = renderHook(() =>
        useStopWorkDialog([makeRow(100)], mockClear, mockReload)
    );
    act(() => result.current.handleOpen());
    act(() => result.current.setOrderQty(999));
    expect(result.current.orderQty).toBe(999);
  });

  it('selectedRows가 비어있으면 handleOpen 시 orderQty가 0으로 초기화된다', () => {
    const { result } = renderHook(() => useStopWorkDialog([], mockClear, mockReload));
    act(() => result.current.handleOpen());
    expect(result.current.orderQty).toBe(0);
  });

  it('handleConfirm 성공 시 open이 false가 되고 onReload가 호출된다', async () => {
    (productionOrderService.stopWork as jest.Mock).mockResolvedValue({
      data: { resultCode: 200, resultMessage: '작업중단 처리가 완료되었습니다.' },
    });

    const { result } = renderHook(() =>
        useStopWorkDialog([makeRow(100)], mockClear, mockReload)
    );
    act(() => result.current.handleOpen());
    act(() => result.current.setOrderQty(80));

    await act(() => result.current.handleConfirm());

    await waitFor(() => {
      expect(result.current.open).toBe(false);
      expect(mockReload).toHaveBeenCalledTimes(1);
      expect(mockClear).toHaveBeenCalledTimes(1);
    });
  });

  it('handleConfirm 실패 시 open이 유지된다', async () => {
    (productionOrderService.stopWork as jest.Mock).mockRejectedValue(new Error('서버 오류'));

    const { result } = renderHook(() =>
        useStopWorkDialog([makeRow(100)], mockClear, mockReload)
    );
    act(() => result.current.handleOpen());

    await act(() => result.current.handleConfirm());

    await waitFor(() => {
      expect(result.current.open).toBe(true);
      expect(mockReload).not.toHaveBeenCalled();
    });
  });
});
