import { GridRowId } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import { Item, ItemSearchParams, InProcessFlow } from '../../../../../types/item';
import itemService from '../../../../../services/itemService';


export function useItemList() {
  /** 데이터 */
  const [rows, setRows] = useState<Item[]>([]);
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
  const [searchDraft, setSearchDraft] = useState<ItemSearchParams>({
    searchCnd: '0',
    searchWrd: '',
    useYn: 'Y',
    inProcessFlowYn: InProcessFlow.UNREGISTERED, // 기본: 미등록
  });

  /** 검색 - 실제 조회용 */
  const [searchParams, setSearchParams] = useState<ItemSearchParams>({
    searchCnd: '0',
    searchWrd: '',
    useYn: 'Y',
    inProcessFlowYn: InProcessFlow.UNREGISTERED, // 기본: 미등록
  });

  /** 선택 */
  const [selected, setSelected] = useState<GridRowId[]>([]);

  /** 조회 */
  const fetchList = async (p = page, ps = pageSize, s = searchParams) => {
    const res = await itemService.getItemList(p, ps, s);
    setRows(res?.result?.resultList ?? []);
    setTotalCount(res?.result?.resultCnt ?? 0);
  };

  /** 페이징 / 검색조건 변경 시 조회 */
  useEffect(() => {
    fetchList();
    // 페이지 이동 시 선택 초기화 원하면 ↓
    setSelected([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, searchParams]);

  /** 검색 버튼 */
  const handleSearchItem = () => {
    setPage(0);
    setSearchParams({ ...searchDraft });
  };

  /** 검색 조건 입력 */
  const updateSearchDraft = (name: keyof ItemSearchParams, value: string) => {
    setSearchDraft((prev) => ({ ...prev, [name]: value }));
  };

  /** 초기화 */
  const reset = () => {
    const init: ItemSearchParams = {
      searchCnd: '0',
      searchWrd: '',
      useYn: 'Y',
      inProcessFlowYn: InProcessFlow.UNREGISTERED,
    };

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
    handleSearchItem,

    /** selection */
    selected,
    setSelected,

    /** utils */
    reset,
  };
}
