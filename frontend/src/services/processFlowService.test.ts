import type { Mock } from 'vitest';
import apiClient from './api';
import { processFlowService } from './processFlowService';

vi.mock('./api', () => ({
  __esModule: true,
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

describe('processFlowService', () => {
  it('품목 delta는 flowId를 URL에 넣고 ID 배열만 전송한다', async () => {
    (apiClient.post as Mock).mockResolvedValue({
      data: {
        resultCode: 200,
        result: { addedItems: [], deletedFlowItemIds: [] },
      },
    });

    await processFlowService.saveFlowItemsDelta('PF-1', {
      addItemIds: ['ITEM-1'],
      deleteFlowItemIds: ['FI-1'],
    });

    expect(apiClient.post).toHaveBeenCalledWith(
      '/api/processflow/PF-1/item/delta',
      { addItemIds: ['ITEM-1'], deleteFlowItemIds: ['FI-1'] },
    );
  });

  it('공정 상세 응답의 seq를 number DTO로 정규화한다', async () => {
    (apiClient.get as Mock).mockResolvedValue({
      data: {
        resultCode: 200,
        result: {
          resultList: [
            {
              flowProcessId: 'FP-1',
              flowProcessCode: 'PROC-1',
              flowProcessName: '절단',
              equipmentFlag: 'N',
              seq: '1',
              planFlag: 'Y',
              lastFlag: 'N',
              erpResultFlag: 'N',
            },
          ],
        },
      },
    });

    const result = await processFlowService.getProcessFlowProcess('PF-1');

    expect(result[0].seq).toBe(1);
  });
});
