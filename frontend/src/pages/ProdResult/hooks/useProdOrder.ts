import {useEffect, useState} from "react";
import {productionResultService} from "../../../services/productionResultService";
import {useToast} from "../../../components/common/Feedback/ToastProvider";
import {ProductionResultOrder} from "../../../types/productionResult";

export function useProdOrder() {

    const { showToast } = useToast();

    // 검색 조건
    const today = new Date().toISOString().slice(0, 10);
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - 7);

    const [search, setSearch] = useState({
        workplace: "",
        equipment: "",
        dateFrom: dateFrom.toISOString().slice(0, 10),
        dateTo: today,
        keyword: "", //통합검색
    });

    // 테이블 페이징
    const [pagination, setPagination] = useState({
        page: 0,
        pageSize: 20,
    });

    // 데이터 상태
    const [rows, setRows] = useState<ProductionResultOrder[]>([]);
    const [rowCount, setRowCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [searchTrigger, setSearchTrigger] = useState(0); // 통합검색 입력 될때마다 검색되는현상 방지

    // API 호출
    const fetchList = async () => {
        setLoading(true);
        try {
            const params = {
                ...search,
                page: pagination.page,
                size: pagination.pageSize,
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

    const handlePageChange = (page: number) => {
        setPagination(prev => ({ ...prev, page }));
    };

    const handlePageSizeChange = (pageSize: number) => {
        setPagination({ page: 0, pageSize });
    };

    const handleSearchChange = (name: string, value: string) => {
        setSearch(prev => ({ ...prev, [name]: value }));
    };

    // 검색 버튼
    const handleSearch = () => {
        setPagination(prev => ({ ...prev, page: 0 })); // 검색 시 첫 페이지로
        setSearchTrigger(t => t + 1);
    };

    // 페이지 변경 시 + 검색버튼 누를 시 자동 fetch
    useEffect(() => {
        fetchList();
    }, [pagination.page, pagination.pageSize, searchTrigger]);


    return {
        search,
        setSearch,
        handleSearchChange,
        handleSearch,

        rows,
        rowCount,
        loading,

        pagination,
        setPagination,
        handlePageChange,
        handlePageSizeChange,
    };
}