import { useEffect, useState } from "react";
import {useToast} from "../../../components/common/Feedback/ToastProvider";
import {useProdPlan} from "./useProdPlan";
import {useProdOrder} from "./useProdOrder";
import {useProdOrderDialog} from "./useProdOrderDialog";
import {productionOrderService} from "../../../services/productionOrderService";
import {useFetchWorkplaces} from "../../../hooks/useFetchWorkplaces";

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

    const wpfetchHook = useFetchWorkplaces();
    const prodPlan = useProdPlan();
    const prodOrder = useProdOrder(selectedPlan);

    const handleSaveOrders: () => Promise<void> = async () => {
        try {

            const payload = localRows.map((row, index) => ({
                ...row,
                WORKORDER_SEQ: index + 1,   // 화면 순서대로
            }));

            const response = await productionOrderService.createProductionOrder(payload);
            showToast({
                message: "등록되었습니다.",
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
                ) as any | undefined;

                if (refreshed) {
                    const updatedPlan = {
                        ...refreshed,
                        ORDER_FLAG: 'ORDERED',
                    };
                    setSelectedPlan(updatedPlan);
                    await prodOrder.fetchProdOrders(updatedPlan);
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


    const dialog = useProdOrderDialog(handleSaveOrders);


    // 생산계획 row 선택했을때
    const handlePlanSelect = async (row: any) => {
        setSelectedPlan(row);
        dialog.openDialog();
    };

    useEffect(() => {
        setLocalRows(prodOrder.orderRows);
    }, [prodOrder.orderRows]);


    const handleAddRow = (index: number) => {
        setLocalRows(prev => {
            const base = prev[index];   // 분할 기준 행

            const newRow = {
                ...base, // 전체 행 복사
                IDX: `${Date.now()}_${Math.random()}`,
                _isNew: true,
                WORKORDER_SEQ: 0,
            };

            const copy = [...prev];
            copy.splice(index + 1, 0, newRow);
            return copy;
        });
    };


    const handleProcessRowUpdate = (newRow: any) => {
        setLocalRows((prev) =>
            prev.map((r) => (r.IDX === newRow.IDX ? newRow : r))
        );
        return newRow;
    };



    return {
        selectedPlan,
        planRows: prodPlan.planRows,
        planLoading: prodPlan.loading,
        localRows,
        orderLoading: prodOrder.loading,
        setLocalRows,
        search: prodPlan.search,
        handleSearchChange: prodPlan.handleSearchChange,
        handleSearch: prodPlan.handleSearch,
        handlePlanSelect,
        handleAddRow,
        handleSaveOrders,

        workplaces: wpfetchHook.workplaces,

        paginationModel: prodPlan.paginationModel,
        handlePaginationChange: prodPlan.handlePaginationChange,
        totalCount: prodPlan.totalCount,

        open: dialog.open,
        openDialog: dialog.openDialog,
        closeDialog: dialog.closeDialog,
        submit: dialog.submit,


        handleProcessRowUpdate

    };


}