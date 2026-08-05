import type { Mock } from 'vitest';
import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useProdResultDetail } from './useProdResultDetail';
import { ProdResultOrderRow, ProductionResultDetail } from '../../../types/productionResult';
import { productionResultService } from '../../../services/productionResultService';
import workplaceService from '../../../services/workplaceService';

vi.mock('../../../services/productionResultService', () => ({
  productionResultService: {
    getProdResultDetails: vi.fn(),
    updateProdResult: vi.fn(),
    createProdResult: vi.fn(),
    deleteProdResult: vi.fn(),
    getBadDetails: vi.fn(),
  },
}));

vi.mock('../../../services/workplaceService', () => ({
  default: {
    getWorkplaceWorkers: vi.fn(),
  },
}));

const mockShowToast = vi.fn();
vi.mock('../../../components/common/Feedback/ToastProvider', () => ({
  useToast: () => ({ showToast: mockShowToast }),
}));

const makeParentRow = (overrides: Partial<ProdResultOrderRow> = {}): ProdResultOrderRow => ({
  factoryCode: 'F1',
  prodplanId: 'P1',
  prodplanDate: '20260727',
  prodplanSeq: 1,
  prodworkSeq: 1,
  workSeq: 1,
  prodSeq: 1,
  workdtDate: '20260727',
  workcenterCode: 'WC1',
  workcenterName: '작업장A',
  workCode: 'W1',
  workName: '공정A',
  itemCode: 'ITEM1',
  itemName: '품목A',
  lotNo: '',
  prodCode: '',
  prodName: '',
  prodSpec: '',
  equipSysCd: '',
  equipSysCdNm: '',
  orderQty: 100,
  prodQty: 100,
  goodQty: 90,
  badQty: 10,
  rcvQty: 0,
  workorderSeq: null,
  orderFlag: '',
  bigo: '',
  opmanCode: '',
  optime: '',
  opmanCode2: '',
  optime2: '',
  tpr601Id: 'T1',
  tpr504Id: 'TPR504-1',
  ...overrides,
});

const makeDetailRow = (overrides: Partial<ProductionResultDetail> = {}): ProductionResultDetail => ({
  factoryCode: 'F1',
  prodplanDate: '20260727',
  prodplanSeq: 1,
  prodworkSeq: 1,
  workSeq: 1,
  prodSeq: 1,
  itemCode: 'ITEM1',
  workCode: 'W1',
  orderFlag: '',
  workdtDate: '20260727',
  prodStime: '2026-07-27 09:00',
  prodEtime: '2026-07-27 10:00',
  prodQty: 100,
  goodQty: 90,
  badQty: 10,
  rcvQty: 0,
  workorderSeq: null,
  erpSendFlag: null,
  erpRsltIdx: null,
  workerCodes: [],
  inputMaterial: '',
  opmanCode: '',
  optime: '',
  opmanCode2: null,
  optime2: null,
  tpr601Id: 'T1',
  tpr504Id: 'TPR504-1',
  prodplanId: 'P1',
  ...overrides,
});

beforeEach(() => {
  vi.clearAllMocks();
  (productionResultService.getProdResultDetails as Mock).mockResolvedValue({
    result: { resultList: [] },
  });
  (workplaceService.getWorkplaceWorkers as Mock).mockResolvedValue({
    resultCode: 200,
    result: { resultList: [] },
  });
});

// mount 시 fetchDetails/fetchWorkers가 자동 실행되므로, 렌더 직후 그 promise를 flush해준다.
// useQuery/useMutation을 쓰므로 QueryClientProvider로 감싸야 한다.
const setup = async (parentRow: ProdResultOrderRow) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);

  const utils = renderHook(() => useProdResultDetail(parentRow), { wrapper });
  await act(async () => {});
  return utils;
};

describe('useProdResultDetail - normalizeRows (조회 결과 정규화)', () => {
  it('workerCodes가 배열이면 그대로 유지한다', async () => {
    (productionResultService.getProdResultDetails as Mock).mockResolvedValue({
      result: { resultList: [{ ...makeDetailRow(), workerCodes: ['A', 'B'] }] },
    });

    const { result } = await setup(makeParentRow());

    await waitFor(() => expect(result.current.rows).toHaveLength(1));
    expect(result.current.rows[0].workerCodes).toEqual(['A', 'B']);
  });

  it('workerCodes가 콤마 문자열이면 배열로 변환한다', async () => {
    (productionResultService.getProdResultDetails as Mock).mockResolvedValue({
      result: { resultList: [{ ...makeDetailRow(), workerCodes: 'A,B' as unknown as string[] }] },
    });

    const { result } = await setup(makeParentRow());

    await waitFor(() => expect(result.current.rows).toHaveLength(1));
    expect(result.current.rows[0].workerCodes).toEqual(['A', 'B']);
  });

  it('workerCodes가 없으면 빈 배열이 된다', async () => {
    (productionResultService.getProdResultDetails as Mock).mockResolvedValue({
      result: { resultList: [{ ...makeDetailRow(), workerCodes: null as unknown as string[] }] },
    });

    const { result } = await setup(makeParentRow());

    await waitFor(() => expect(result.current.rows).toHaveLength(1));
    expect(result.current.rows[0].workerCodes).toEqual([]);
  });
});

describe('useProdResultDetail - addRow (신규 행 추가)', () => {
  it('신규 행은 수량 0, __isModified true로 생성된다', async () => {
    const { result } = await setup(makeParentRow());

    act(() => result.current.addRow());

    const newRow = result.current.rows[result.current.rows.length - 1];
    expect(newRow.prodQty).toBe(0);
    expect(newRow.goodQty).toBe(0);
    expect(newRow.badQty).toBe(0);
    expect(newRow.__isModified).toBe(true);
    expect(newRow.tpr601Id.startsWith('NEW-')).toBe(true);
  });

  it('workdtDate가 YYYY-MM-DD 형식이면 그 날짜로 시작/종료시간을 세팅한다', async () => {
    const { result } = await setup(makeParentRow({ workdtDate: '2026-07-27' }));

    act(() => result.current.addRow());

    const newRow = result.current.rows[0];
    expect(newRow.prodStime.startsWith('2026-07-27')).toBe(true);
    expect(newRow.prodEtime).toBe(newRow.prodStime);
  });

  it('workdtDate가 YYYYMMDD 형식이어도 같은 날짜로 파싱한다', async () => {
    const { result } = await setup(makeParentRow({ workdtDate: '20260727' }));

    act(() => result.current.addRow());

    expect(result.current.rows[0].prodStime.startsWith('2026-07-27')).toBe(true);
  });

  it('workdtDate가 비어있으면 오늘 날짜로 폴백한다', async () => {
    const { result } = await setup(makeParentRow({ workdtDate: '' }));

    act(() => result.current.addRow());

    const today = dayjs().format('YYYY-MM-DD');
    expect(result.current.rows[0].prodStime.startsWith(today)).toBe(true);
  });
});

describe('useProdResultDetail - processRowUpdate (양품/불량 자동계산)', () => {
  it('종료시간이 시작시간보다 빠르면 변경을 거부하고 oldRow를 반환한다', async () => {
    const { result } = await setup(makeParentRow());
    const oldRow = makeDetailRow({ prodStime: '2026-07-27 10:00', prodEtime: '2026-07-27 10:00' });
    const newRow = { ...oldRow, prodEtime: '2026-07-27 09:00' };

    let returned: ProductionResultDetail;
    act(() => {
      returned = result.current.processRowUpdate(newRow, oldRow);
    });

    expect(returned!).toBe(oldRow);
    expect(mockShowToast).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'error',
        message: '종료시간은 시작시간보다 커야 합니다.',
      })
    );
  });

  it('양품수량을 수정하면 불량수량이 자동 계산된다', async () => {
    const { result } = await setup(makeParentRow());
    const oldRow = makeDetailRow({ prodQty: 100, goodQty: 90, badQty: 10 });
    const newRow = { ...oldRow, goodQty: 80 };

    let returned: ProductionResultDetail;
    act(() => {
      returned = result.current.processRowUpdate(newRow, oldRow);
    });

    expect(returned!.badQty).toBe(20);
  });

  it('불량수량을 수정하면 양품수량이 자동 계산된다', async () => {
    const { result } = await setup(makeParentRow());
    const oldRow = makeDetailRow({ prodQty: 100, goodQty: 90, badQty: 10 });
    const newRow = { ...oldRow, badQty: 30 };

    let returned: ProductionResultDetail;
    act(() => {
      returned = result.current.processRowUpdate(newRow, oldRow);
    });

    expect(returned!.goodQty).toBe(70);
  });

  it('생산수량을 수정하면 불량수량은 유지한 채 양품수량을 재계산한다', async () => {
    const { result } = await setup(makeParentRow());
    const oldRow = makeDetailRow({ prodQty: 100, goodQty: 90, badQty: 10 });
    const newRow = { ...oldRow, prodQty: 150 };

    let returned: ProductionResultDetail;
    act(() => {
      returned = result.current.processRowUpdate(newRow, oldRow);
    });

    expect(returned!.badQty).toBe(10);
    expect(returned!.goodQty).toBe(140);
  });

  // 회귀 테스트: BadQtyDialog에서 badQty를 먼저 세팅한 뒤(useProdResultDetail.ts와 무관한
  // 별도 경로, ProdResultList.tsx:443 setRows 직접 호출) grid에서 prodQty를 badQty보다
  // 작게 낮추면, 현재 코드는 badQty를 그대로 두고 goodQty만 0으로 내려서
  // badQty(10) + goodQty(0) > prodQty(5) 인 불가능한 상태가 남는다.
  it('prodQty가 기존 badQty보다 작아지면 badQty도 prodQty 이하로 줄어야 한다', async () => {
    const { result } = await setup(makeParentRow());
    const oldRow = makeDetailRow({ prodQty: 100, goodQty: 90, badQty: 10 });
    const newRow = { ...oldRow, prodQty: 5 };

    let returned: ProductionResultDetail;
    act(() => {
      returned = result.current.processRowUpdate(newRow, oldRow);
    });

    expect(returned!.badQty).toBeLessThanOrEqual(5);
    expect((returned!.goodQty ?? 0) + (returned!.badQty ?? 0)).toBe(5);
  });

  it('불량수량이 생산수량을 초과해도 음수가 되지 않는다', async () => {
    const { result } = await setup(makeParentRow());
    const oldRow = makeDetailRow({ prodQty: 100, goodQty: 90, badQty: 10 });
    const newRow = { ...oldRow, goodQty: 150 };

    let returned: ProductionResultDetail;
    act(() => {
      returned = result.current.processRowUpdate(newRow, oldRow);
    });

    expect(returned!.badQty).toBe(0);
  });

  it('prodEtime이 빈 문자열이면 null로 정규화되고 orderFlag가 2가 된다', async () => {
    const { result } = await setup(makeParentRow());
    const oldRow = makeDetailRow();
    const newRow = { ...oldRow, prodEtime: '' };

    let returned: ProductionResultDetail;
    act(() => {
      returned = result.current.processRowUpdate(newRow, oldRow);
    });

    expect(returned!.prodEtime).toBeNull();
    expect(returned!.orderFlag).toBe('2');
  });

  it('prodEtime이 있으면 orderFlag가 1이 된다', async () => {
    const { result } = await setup(makeParentRow());
    const oldRow = makeDetailRow();
    const newRow = { ...oldRow, goodQty: 95 };

    let returned: ProductionResultDetail;
    act(() => {
      returned = result.current.processRowUpdate(newRow, oldRow);
    });

    expect(returned!.orderFlag).toBe('1');
  });

  it('변경된 행은 __isModified가 true로 설정된다', async () => {
    const { result } = await setup(makeParentRow());
    const oldRow = makeDetailRow({ __isModified: false });
    const newRow = { ...oldRow, goodQty: 95 };

    let returned: ProductionResultDetail;
    act(() => {
      returned = result.current.processRowUpdate(newRow, oldRow);
    });

    expect(returned!.__isModified).toBe(true);
  });
});

describe('useProdResultDetail - handleSave (신규/수정 분리 저장)', () => {
  beforeEach(() => {
    (productionResultService.updateProdResult as Mock).mockResolvedValue({
      data: { resultCode: 200, resultMessage: '수정되었습니다' },
    });
    (productionResultService.createProdResult as Mock).mockResolvedValue({
      data: { resultCode: 200, resultMessage: '등록되었습니다' },
    });
  });

  it('변경사항이 없으면 저장을 호출하지 않고 warning 토스트를 띄운다', async () => {
    const { result } = await setup(makeParentRow());

    let saved: boolean | undefined;
    await act(async () => {
      saved = await result.current.handleSave();
    });

    expect(saved).toBe(false);
    expect(productionResultService.updateProdResult).not.toHaveBeenCalled();
    expect(productionResultService.createProdResult).not.toHaveBeenCalled();
    expect(mockShowToast).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'warning', message: '저장할 변경사항이 없습니다.' })
    );
  });

  it('prodQty가 0 이하인 행이 있으면 저장 전체를 차단한다', async () => {
    const { result } = await setup(makeParentRow());
    act(() => {
      result.current.setRows([
        makeDetailRow({ tpr601Id: 'EXIST-1', prodQty: 0, __isModified: true }),
      ]);
    });

    let saved: boolean | undefined;
    await act(async () => {
      saved = await result.current.handleSave();
    });

    expect(saved).toBe(false);
    expect(productionResultService.updateProdResult).not.toHaveBeenCalled();
    expect(productionResultService.createProdResult).not.toHaveBeenCalled();
    expect(mockShowToast).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'warning', message: '생산수량은 0보다 커야 합니다.' })
    );
  });

  it('신규 행과 수정 행을 분리해서 각각 create/update를 호출한다', async () => {
    const { result } = await setup(makeParentRow());
    const newRow = makeDetailRow({ tpr601Id: 'NEW-1', prodQty: 50 });
    const modifiedRow = makeDetailRow({ tpr601Id: 'EXIST-1', prodQty: 80, __isModified: true });
    const unmodifiedRow = makeDetailRow({ tpr601Id: 'EXIST-2', prodQty: 70, __isModified: false });

    act(() => {
      result.current.setRows([newRow, modifiedRow, unmodifiedRow]);
    });

    let saved: boolean | undefined;
    await act(async () => {
      saved = await result.current.handleSave();
    });

    expect(saved).toBe(true);
    expect(productionResultService.updateProdResult).toHaveBeenCalledWith([modifiedRow]);
    expect(productionResultService.createProdResult).toHaveBeenCalledWith([newRow]);
    expect(mockShowToast).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'success', message: '등록되었습니다' })
    );
    // 저장 성공 후 목록을 재조회한다 (mount 시 1회 + 저장 후 1회)
    expect(productionResultService.getProdResultDetails).toHaveBeenCalledTimes(2);
  });

  it('수정 저장이 실패하면 신규 등록은 호출하지 않는다', async () => {
    (productionResultService.updateProdResult as Mock).mockResolvedValue({
      data: { resultCode: 500, resultMessage: '수정 중 오류가 발생했습니다.' },
    });

    const { result } = await setup(makeParentRow());
    const newRow = makeDetailRow({ tpr601Id: 'NEW-1', prodQty: 50 });
    const modifiedRow = makeDetailRow({ tpr601Id: 'EXIST-1', prodQty: 80, __isModified: true });

    act(() => {
      result.current.setRows([newRow, modifiedRow]);
    });

    await act(async () => {
      await result.current.handleSave();
    });

    expect(productionResultService.createProdResult).not.toHaveBeenCalled();
    expect(mockShowToast).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'error', message: '수정 중 오류가 발생했습니다.' })
    );
  });
});

describe('useProdResultDetail - handleDeleteRow (실적 삭제)', () => {
  it('삭제 성공 후 목록을 재조회한다', async () => {
    (productionResultService.deleteProdResult as Mock).mockResolvedValue({
      data: { resultCode: 200, resultMessage: '삭제되었습니다' },
    });
    (productionResultService.getProdResultDetails as Mock).mockResolvedValue({
      result: { resultList: [makeDetailRow({ tpr601Id: 'EXIST-1' })] },
    });

    const { result } = await setup(makeParentRow());
    await waitFor(() => expect(result.current.rows).toHaveLength(1));

    await act(async () => {
      await result.current.handleDeleteRow(result.current.rows[0]);
    });

    // mount 시 1회 + 삭제 후 1회
    expect(productionResultService.getProdResultDetails).toHaveBeenCalledTimes(2);
    expect(mockShowToast).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'success', message: '삭제되었습니다' })
    );
  });
});
