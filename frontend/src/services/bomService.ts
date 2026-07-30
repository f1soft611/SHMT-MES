import apiClient from './api';
import { BomItemSearchRow, BomTreeRow } from '../types/bom';

interface BomApiResponse<T> {
  resultCode: number;
  resultMessage: string;
  result: T;
}

export interface BomItemSearchResult {
  resultList: BomItemSearchRow[];
  resultCnt: number;
}

const bomService = {
  /**
   * BOM 조회 대상 품목 검색 (서버 페이징)
   */
  searchItems: async (
    searchCnd: string,
    searchWrd: string,
    pageIndex: number,
    pageUnit: number,
  ): Promise<BomItemSearchResult> => {
    const response = await apiClient.get<
      BomApiResponse<{ resultList: BomItemSearchRow[]; resultCnt: number }>
    >('/api/bom/items', { params: { searchCnd, searchWrd, pageIndex, pageUnit } });
    if (response.data.resultCode !== 200) {
      throw new Error(response.data.resultMessage || 'BOM 품목 검색에 실패했습니다.');
    }
    return {
      resultList: response.data.result?.resultList ?? [],
      resultCnt: response.data.result?.resultCnt ?? 0,
    };
  },

  /**
   * 선택한 품목의 BOM 트리 조회
   */
  getBomTree: async (itemSeq: number): Promise<BomTreeRow[]> => {
    const response = await apiClient.get<BomApiResponse<{ tree: BomTreeRow[] }>>(
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
