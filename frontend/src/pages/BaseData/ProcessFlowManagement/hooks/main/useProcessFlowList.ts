import {useCallback, useEffect, useState} from 'react';
import { GridPaginationModel } from '@mui/x-data-grid';
import {ProcessFlow} from "../../../../../types/processFlow";
import processFlowService from "../../../../../services/processFlowService";

const SEARCH_STORAGE_KEY = 'processFlowManagement.searchParams';

interface ProcessFlowSearchParams {
    searchCnd: string;
    searchWrd: string;
    status: string;
}

const getStoredSearchParams = (): ProcessFlowSearchParams => {
    try {
        const stored = sessionStorage.getItem(SEARCH_STORAGE_KEY);
        if (stored) return JSON.parse(stored);
    } catch {
        // ignore
    }
    return {
        searchCnd: '1',
        searchWrd: '',
        status: '',
    };
};

export function useProcessFlowList() {
    const [rows, setRows] = useState<ProcessFlow[]>([]);
    const [rowCount, setRowCount] = useState(0);
    const [loading, setLoading] = useState(false);

    //
    // 페이지네이션
    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
        page: 0,
        pageSize: 10,
    });

    // 실제 검색에 사용되는 파라미터
    const [searchParams, setSearchParams] = useState(getStoredSearchParams);

    // 입력 필드용 상태 (화면 입력용)
    const [inputValues, setInputValues] = useState(getStoredSearchParams);

    // 입력 변경 처리
    const handleInputChange = (field: string, value: string) => {
        setInputValues(prev => ({ ...prev, [field]: value }));
    };

    const fetchProcessFlows = useCallback(async (
        page = paginationModel.page,
        pageSize = paginationModel.pageSize,
        params = searchParams
    ) => {
        try {
            setLoading(true);
            const res = await processFlowService.getProcessFlowList(page, pageSize, params);
            if (res.resultCode === 200 && res.result?.resultList) {
                setRows(res.result.resultList);
                setRowCount(res.result.resultCnt ?? 0);
            } else {
                setRows([]);
                setRowCount(0);
            }
        } catch (e) {
            console.error(e);
            setRows([]);
            setRowCount(0);
        } finally {
            setLoading(false);
        }
    }, [paginationModel.page, paginationModel.pageSize, searchParams]);



    // 검색 실행 (입력값 → 검색 파라미터 복사 + 페이지 초기화)
    const handleSearch = () => {
        setSearchParams({ ...inputValues });
        setPaginationModel(prev => ({ ...prev, page: 0 }));

        // 조회 실행
        fetchProcessFlows(0, paginationModel.pageSize, {
            ...inputValues
        });

    };

    // 목록 재조회
    useEffect(() => {
        fetchProcessFlows();
    }, [fetchProcessFlows]);

    // 검색 조건을 세션에 저장해 다른 페이지 이동 후 복귀 시에도 유지
    useEffect(() => {
        try {
            sessionStorage.setItem(SEARCH_STORAGE_KEY, JSON.stringify(searchParams));
        } catch {
            // ignore
        }
    }, [searchParams]);


    return {
        rows,
        rowCount,
        loading,
        paginationModel,
        setPaginationModel,
        searchParams,
        setSearchParams,
        inputValues,
        setInputValues,
        handleInputChange,
        handleSearch,
        fetchProcessFlows
    };

}
