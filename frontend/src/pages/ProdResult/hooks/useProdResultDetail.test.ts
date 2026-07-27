import type { Mock } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
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
const setup = async (parentRow: ProdResultOrderRow) => {
  const utils = renderHook(() => useProdResultDetail(parentRow));
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
