import { useEffect, useState } from "react";
import { useProdPlan } from "./useProdPlan";
import { useProdOrder } from "./useProdOrder";
import {productionOrderService} from "../../../services/productionOrderService";
import {useToast} from "../../../components/common/Feedback/ToastProvider";
import {useProdOrderSearchFilter} from "./useProdOrderSearchFilter";


interface ProdPlanRow {
    PRODPLAN_ID: string;
    PRODPLAN_SEQ: number;
    [key: string]: any;
}

export function useProductionOrder() {

    const { showToast } = useToast();

    const searchFilter = useProdOrderSearchFilter();
    const prodPlan = useProdPlan();
    const { orderRows, loading: orderLoading, fetchProdOrders } = useProdOrder();

    // 위 그리드 선택된 데이터
    const [selectedPlan, setSelectedPlan] = useState<ProdPlanRow | null>(null);
    const [localRows, setLocalRows] = useState<any[]>([]);


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
            const {data} = await productionOrderService.createProductionOrder(localRows);
            if (data.resultCode !== 200) {
                showToast({ message: data.resultMessage, severity: "error" });
                return;
            }

            showToast({
                message: data.resultMessage,
                severity: 'success',
            });
            // 저장 후 목록 리로드
            await prodPlan.fetchProdPlan();

            // 기존 선택된 행 다시 선택 처리
            if (selectedPlan) {
                // planRows 새로 갱신된 후 그리드 데이터에서 같은 row 찾기
                const refreshed = prodPlan.planRows.find(
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
        planRows: prodPlan.planRows,
        planLoading: prodPlan.loading,
        localRows, orderLoading,
        setLocalRows,
        search: prodPlan.search,
        handleSearchChange: prodPlan.handleSearchChange,
        handleSearch: prodPlan.handleSearch,
        handlePlanSelect,
        handleAddRow,
        handleSaveOrders,

        workplaces: searchFilter.workplaces,

        paginationModel: prodPlan.paginationModel,
        handlePaginationChange: prodPlan.handlePaginationChange,
        totalCount: prodPlan.planResultCnt
    };
}