import { useEffect, useState } from 'react';
import { GridPaginationModel } from '@mui/x-data-grid';
import { useToast } from '../../../components/common/Feedback/ToastProvider';
import {
  ProductionDefectRateRow,
  ProductionDefectRateSearchParams,
} from '../../../types/productionDefectRate';
import { useFetchWorkplaces } from '../../../hooks/useFetchWorkplaces';
import { useFetchEquipments } from '../../../hooks/useFetchEquipments';
import { productionDefectRateService } from '../../../services/productionDefectRateService';
import commonCodeService from '../../../services/commonCodeService';
import { CommonDetailCode } from '../../../types/commonCode';

const DEFECT_RATE_SEARCH_SESSION_KEY = 'defectRateStatus.search';

const getDefaultSearch = (): ProductionDefectRateSearchParams => {
  const today = new Date().toISOString().slice(0, 10);
  const dateTo = new Date();
  dateTo.setDate(dateTo.getDate() + 7);

  return {
    workplace: '',
    equipment: '',
    defectCode: '',
    dateFrom: today,
    dateTo: dateTo.toISOString().slice(0, 10),
    completeFrom: '',
    completeTo: '',
  };
};

const getInitialSearch = (): ProductionDefectRateSearchParams => {
  const defaultSearch = getDefaultSearch();

  try {
    const savedSearch = sessionStorage.getItem(DEFECT_RATE_SEARCH_SESSION_KEY);
    if (!savedSearch) {
      return defaultSearch;
    }

    const parsed = JSON.parse(savedSearch);
    if (!parsed || typeof parsed !== 'object') {
      return defaultSearch;
    }

    return {
      ...defaultSearch,
      workplace:
        typeof parsed.workplace === 'string'
          ? parsed.workplace
          : defaultSearch.workplace,
      equipment:
        typeof parsed.equipment === 'string'
          ? parsed.equipment
          : defaultSearch.equipment,
      defectCode:
        typeof parsed.defectCode === 'string'
          ? parsed.defectCode
          : defaultSearch.defectCode,
      dateFrom:
        typeof parsed.dateFrom === 'string'
          ? parsed.dateFrom
          : defaultSearch.dateFrom,
      dateTo:
        typeof parsed.dateTo === 'string'
          ? parsed.dateTo
          : defaultSearch.dateTo,
      completeFrom:
        typeof parsed.completeFrom === 'string'
          ? parsed.completeFrom
          : defaultSearch.completeFrom,
      completeTo:
        typeof parsed.completeTo === 'string'
          ? parsed.completeTo
          : defaultSearch.completeTo,
    };
  } catch {
    return defaultSearch;
  }
};

export function useDefectRate() {
  const { showToast } = useToast();

  /** 검색조건 */
  const [search, setSearch] = useState<ProductionDefectRateSearchParams>(() =>
    getInitialSearch(),
  );

  const [defectTypes, setDefectTypes] = useState<CommonDetailCode[]>([]);

  /** 페이징 */
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 20,
  });

  /** 리스트 */
  const [rows, setRows] = useState<ProductionDefectRateRow[]>([]);
  const [rowCount, setRowCount] = useState(0);

  /** 로딩 */
  const [loading, setLoading] = useState(false);

  /** 검색조건 변경 */
  const onChange = (
    name: keyof ProductionDefectRateSearchParams,
    value: string,
  ) => {
    setSearch((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onSearch = async (model = paginationModel) => {
    try {
      setLoading(true);
      const params = {
        ...search,
        page: model.page,
        size: model.pageSize,
      };

      const response =
        await productionDefectRateService.getProdDefectRateList(params);
      setRows(response.result?.resultList ?? []);
      setRowCount(response.result.resultCnt ?? 0);
    } catch (err: any) {
      showToast({
        message: '목록 조회 실패',
        severity: 'error',
      });
      setRows([]);
      setRowCount(0);
    } finally {
      setLoading(false);
    }
  };

  const onPaginationChange = (model: GridPaginationModel) => {
    setPaginationModel(model);
    onSearch(model);
  };

  useEffect(() => {
    try {
      sessionStorage.setItem(
        DEFECT_RATE_SEARCH_SESSION_KEY,
        JSON.stringify(search),
      );
    } catch {
      // ignore storage errors
    }
  }, [search]);

  useEffect(() => {
    const fetchDefectTypes = async () => {
      try {
        const response = await commonCodeService.getCommonDetailCodeList(
          'COM003',
          'Y',
        );
        if (response.resultCode === 200 && response.result?.detailCodeList) {
          setDefectTypes(response.result.detailCodeList);
        }
      } catch (error) {
        setDefectTypes([]);
      }
    };

    fetchDefectTypes();
  }, []);

  // 작업장 조회
  const workplaces = useFetchWorkplaces();
  //  작업장 코드 기준 설비 자동 조회
  const { equipments } = useFetchEquipments(search.workplace);

  return {
    rows,
    rowCount,
    loading,
    search,
    onChange,
    onSearch,
    workplaces: workplaces.workplaces,
    equipments,
    defectTypes,
    paginationModel,
    onPaginationChange,
  };
}
