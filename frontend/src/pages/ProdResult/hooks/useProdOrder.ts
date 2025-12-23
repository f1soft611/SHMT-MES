import {useEffect, useState} from "react";
import {productionResultService} from "../../../services/productionResultService";
import {GridPaginationModel} from "@mui/x-data-grid";
import {useToast} from "../../../components/common/Feedback/ToastProvider";

export function useProdOrder() {

    const { showToast } = useToast();

    // 검색 조건
    const today = new Date().toISOString().slice(0, 10);
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - 7);
    const dateFromStr = dateFrom.toISOString().slice(0, 10);

    // 검색 상태
    const [search, setSearch] = useState({
        workplace: "",
        equipment: "",
        dateFrom: dateFromStr,
        dateTo: today,
    });

    // DataGrid 페이징
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 20,
    });

    // 데이터 상태
    const [rows, setRows] = useState<any[]>([]);
    const [rowCount, setRowCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [searchTrigger, setSearchTrigger] = useState(0);


    // API 호출
    const fetchList = async () => {
        setLoading(true);
        try {
            const params = {
                ...search,
                page: paginationModel.page,
                size: paginationModel.pageSize,
            };

            const response = await productionResultService.getProdOrders(params)
            setRows(response.result?.resultList ?? []);
            setRowCount(response.result?.totalCount ?? 0);
        } catch (err: any) {
            showToast({
                message: "생산지시 목록 조회 실패",
                severity: 'error',
            })
            setRows([]);
            setRowCount(0);
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

    // 검색 버튼
    const handleSearch = () => {
        setPaginationModel(prev => ({ ...prev, page: 0 })); // 검색 시 첫 페이지로
        setSearchTrigger(t => t + 1);
    };

    // 페이지 변경 시 자동 fetch
    useEffect(() => {
        fetchList();
    }, [
        paginationModel.page,
        paginationModel.pageSize,
        searchTrigger
    ]);


    return {
        search,
        handleSearchChange,
        handleSearch,

        rows,
        rowCount,
        loading,

        paginationModel,
        setPaginationModel,
        handlePaginationChange,
    };
}