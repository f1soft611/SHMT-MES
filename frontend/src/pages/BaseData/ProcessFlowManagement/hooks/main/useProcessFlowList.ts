import {useCallback, useEffect, useState} from 'react';
import { GridPaginationModel } from '@mui/x-data-grid';
import {ProcessFlow} from "../../../../../types/processFlow";
import processFlowService from "../../../../../services/processFlowService";

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
    const [searchParams, setSearchParams] = useState({
        searchCnd: '1',
        searchWrd: '',
        status: '',
    });

    // 입력 필드용 상태 (화면 입력용)
    const [inputValues, setInputValues] = useState({
        searchCnd: '1',
        searchWrd: '',
        status: '',
    });

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
