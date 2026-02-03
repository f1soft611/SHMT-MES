import { useEffect, useState } from 'react';
import {ProcessType} from '../../../../../types/process';
import { GridRowId } from '@mui/x-data-grid';
import processService from '../../../../../services/processService';

interface SearchParams {
  searchCnd: string; // "0": 코드, "1": 명
  searchWrd: string;
  useYn?: string;
}

export function useProcessList() {
  /** 데이터 */
  const [rows, setRows] = useState<ProcessType[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  /** 페이징 */
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const handlePaginationChange = (model: {
    page: number;
    pageSize: number;
  }) => {
    if (model.pageSize !== pageSize) {
      setPage(0);
      setPageSize(model.pageSize);
    } else {
      setPage(model.page);
    }
  };

  /** 검색 - 입력용 */
  const [searchDraft, setSearchDraft] = useState<SearchParams>({
    searchCnd: '0',
    searchWrd: '',
    useYn: 'Y',
  });

  /** 검색 - 실제 조회용 */
  const [searchParams, setSearchParams] = useState<SearchParams>({
    searchCnd: '0',
    searchWrd: '',
    useYn: 'Y',
  });

  /** 선택 */
  const [selected, setSelected] = useState<GridRowId[]>([]);

  /** 조회 */
  const fetchList = async (p = page, ps = pageSize, s = searchParams) => {
    const res = await processService.getProcessList(p, ps, s);
    setRows(res?.result?.resultList ?? []);
    setTotalCount(res?.result?.resultCnt ?? 0);
  };

  /** 페이징/조건 변경 시 재조회 */
  useEffect(() => {
    fetchList();
    // 페이지 이동 시 선택 유지가 싫으면 여기서 clear
    setSelected([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, searchParams]);

  /** 검색 버튼 클릭 */
  const handleSearchProcess = () => {
    setPage(0);
    setSearchParams({ ...searchDraft });
  };

  /** 검색 조건 입력 */
  const updateSearchDraft = (name: keyof SearchParams, value: string) => {
    setSearchDraft((prev) => ({ ...prev, [name]: value }));
  };

  /** 초기화 */
  const reset = () => {
    const init = { searchCnd: '0', searchWrd: '', useYn: 'Y' };
    setSearchDraft(init);
    setSearchParams(init);
    setPage(0);
    setSelected([]);
  };

  return {
    /** rows */
    rows,
    totalCount,

    /** paging */
    page,
    pageSize,
    handlePaginationChange,

    /** search */
    searchDraft,
    updateSearchDraft,
    handleSearchProcess,

    /** selection */
    selected,
    setSelected,

    /** utils */
    fetchList,
    reset,
  };
}
