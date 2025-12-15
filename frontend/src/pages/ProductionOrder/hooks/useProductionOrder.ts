import { useEffect, useState } from "react";
import { useProdPlan } from "./useProdPlan";
import { useProdOrder } from "./useProdOrder";
import {productionOrderService} from "../../../services/productionOrderService";
import {useToast} from "../../../components/common/Feedback/ToastProvider";

interface ProdPlanRow {
    PRODPLAN_ID: string;
    PRODPLAN_SEQ: number;
    [key: string]: any;
}

export function useProductionOrder() {

    const { showToast } = useToast();

    // 위 그리드 선택된 데이터
    const [selectedPlan, setSelectedPlan] = useState<ProdPlanRow | null>(null);
    const [localRows, setLocalRows] = useState<any[]>([]);

    const { rows: planRows, loading: planLoading, fetchProdPlan } = useProdPlan();
    const { rows: orderRows, loading: orderLoading, fetchProdOrders } = useProdOrder();

    // 검색 조건
    const today = new Date().toISOString().slice(0, 10);
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - 30);
    const dateFromStr = dateFrom.toISOString().slice(0, 10);

    const [search, setSearch] = useState({
        workCenter: '',
        dateFrom: dateFromStr,
        dateTo: today
    });

    const handleSearchChange = (name: string, value: string) => {
        setSearch(prev => ({ ...prev, [name]: value }));
    };

    // 검색 실행 함수
    const handleSearchExecute = async () => {
        await fetchProdPlan(search);
    };

    // 생산계획 row 선택했을때
    const handlePlanSelect = async (row: any) => {
        setSelectedPlan(row);
        await fetchProdOrders(row);
    };

    useEffect(() => {
        setLocalRows(orderRows);
    }, [orderRows]);

    const handleAddRow = (index: number) => {
        setLocalRows(prev => {
            const base = prev[index];   // 분할 기준 행

            const newRow = {
                id: Date.now(),
                ...base, // 전체 행 복사
                _isNew: true,
            };

            const copy = [...prev];
            copy.splice(index + 1, 0, newRow);
            return copy;
        });
    };

    const handleSaveOrders = async () => {
        try {
            const response = await productionOrderService.createProductionOrder(localRows);
            showToast({
                message: "등록되었습니다.",
                severity: 'success',
            });
            // 저장 후 목록 리로드
            await fetchProdPlan(search);

            // 기존 선택된 행 다시 선택 처리
            if (selectedPlan) {
                // planRows 새로 갱신된 후 그리드 데이터에서 같은 row 찾기
                const refreshed = planRows.find(
                    (p: any) =>
                        p.PRODPLAN_ID === selectedPlan.PRODPLAN_ID &&
                        p.PRODPLAN_SEQ === selectedPlan.PRODPLAN_SEQ
                );

                if (refreshed) {
                    setSelectedPlan(refreshed);
                    await fetchProdOrders(refreshed);
                }
            }
        } catch (err){
            console.error(err);
            showToast({
                message: "저장 실패하였습니다.",
                severity: 'error',
            });
        }

    };


    return {
        selectedPlan,
        planRows, planLoading,
        localRows, orderLoading,
        setLocalRows,
        search,
        handleSearchChange,
        handleSearchExecute,
        handlePlanSelect,
        handleAddRow,
        handleSaveOrders,
    };
}