import {useEffect, useState} from "react";
import { productionOrderService } from '../../../services/productionOrderService';
import {GridPaginationModel} from "@mui/x-data-grid";

export function useProdPlan() {

    // 검색 조건
    const today = new Date().toISOString().slice(0, 10);
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - 30);
    const dateFromStr = dateFrom.toISOString().slice(0, 10);

    const [search, setSearch] = useState({
        workplace: '',
        dateFrom: dateFromStr,
        dateTo: today
    });

    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
        page: 0,
        pageSize: 10,
    });

    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [resultCnt, setResultCnt] = useState(0);
    const [searchTrigger, setSearchTrigger] = useState(0);

    const fetchProdPlan = async () => {

        try {
            setLoading(true);
            const response = await productionOrderService.getProdPlans({
                ...search,
                page: paginationModel.page,
                size: paginationModel.pageSize,
            });
            setRows(response.result.resultList);
            setResultCnt(response.result.resultCnt);
        } catch (err: any) {
            setRows([]);
            setResultCnt(0);
        } finally {
            setLoading(false);
        }
    };

    const handlePaginationChange = (model: GridPaginationModel) => {
        setPaginationModel(model);
    };

    const handleSearchChange = (name: string, value: string) => {
        setSearch(prev => ({ ...prev, [name]: value }));
    };

    // 검색 실행 함수
    const handleSearch = () => {
        setPaginationModel(p => ({ ...p, page: 0 }));
        setSearchTrigger(t => t + 1);
    };

    useEffect(() => {
        fetchProdPlan();
    }, [
        paginationModel.page,
        paginationModel.pageSize,
        searchTrigger
    ]);

    return {
        planRows: rows,
        loading,
        planResultCnt: resultCnt,
        search,
        handleSearchChange,
        handleSearch,
        paginationModel,
        setPaginationModel,
        handlePaginationChange,
        fetchProdPlan,
    };
}