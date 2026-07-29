import apiClient from './api';
import { BomItemSearchRow, BomTreeNode } from '../types/bom';

interface BomApiResponse<T> {
  resultCode: number;
  resultMessage: string;
  result: T;
}

const bomService = {
  /**
   * BOM 조회 대상 품목 검색
   */
  searchItems: async (keyword: string): Promise<BomItemSearchRow[]> => {
    const response = await apiClient.get<BomApiResponse<{ resultList: BomItemSearchRow[] }>>(
      '/api/bom/items',
      { params: { keyword } },
    );
    if (response.data.resultCode !== 200) {
      throw new Error(response.data.resultMessage || 'BOM 품목 검색에 실패했습니다.');
    }
    return response.data.result?.resultList ?? [];
  },

  /**
   * 선택한 품목의 BOM 트리 조회
   */
  getBomTree: async (itemSeq: number): Promise<BomTreeNode[]> => {
    const response = await apiClient.get<BomApiResponse<{ tree: BomTreeNode[] }>>(
      '/api/bom/tree',
      { params: { itemSeq } },
    );
    if (response.data.resultCode !== 200) {
      throw new Error(response.data.resultMessage || 'BOM 트리 조회에 실패했습니다.');
    }
    return response.data.result?.tree ?? [];
  },
};

export default bomService;
