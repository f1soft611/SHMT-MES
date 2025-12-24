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
                NEW_WORKORDER_SEQ: index + 1,   // 화면 순서대로
            }));

            // console.log(payload)

            const isEmptyId = (v: any) =>
                v === undefined || v === null || v === "" || v === "new";

            const insertRows = payload.filter(
                r => r._isNew || isEmptyId(r.PRODORDER_ID)
            );

            const updateRows = payload.filter(
                r => !r._isNew && !isEmptyId(r.PRODORDER_ID)
            );

            let lastMessage = "저장되었습니다";

            if (updateRows.length > 0) {
                const { data } = await productionOrderService.updateProductionOrder(updateRows);
                if (data.resultCode !== 200) {
                    showToast({ message: data.resultMessage, severity: "error" });
                    return;
                }
                lastMessage = data.resultMessage;
            }

            if (insertRows.length > 0) {
                const { data } = await productionOrderService.createProductionOrder(insertRows);
                if (data.resultCode !== 200) {
                    showToast({ message: data.resultMessage, severity: "error" });
                    return;
                }
                lastMessage = data.resultMessage;
            }

            showToast({
                message: lastMessage,
                severity: "success",
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
        } catch (e) {
            console.log(e);
            showToast({
                message: "저장 실패",
                severity: "error",
            });
        }
    };

    const handleDeleteOrder = async () => {
        try {
            const { data } = await productionOrderService.deleteProductionOrders(selectedPlan);
            if (data.resultCode !== 200) {
                showToast({
                    message: data.resultMessage,
                    severity: "error",
                });
                return;
            }

            showToast({
                message: data.resultMessage,
                severity: "success",
            });

            // 삭제 후 목록 리로드
            await prodPlan.fetchProdPlan();

        } catch (e) {
            console.log(e)
            showToast({
                message: "삭제 요청 중 오류가 발생했습니다.",
                severity: "error",
            });
        }

    }


    const dialog = useProdOrderDialog(
        handleSaveOrders,
        handleDeleteOrder
    );


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
                PRODORDER_ID: '',
                ORDER_SEQ: 0,
                WORKORDER_SEQ: 0,
                IDX: `${Date.now()}_${Math.random()}`,
                _isNew: true,
            };

            const copy = [...prev];
            copy.splice(index + 1, 0, newRow);
            return copy;
        });
    };

    const handleRemoveRow  = (index: number) => {
        setLocalRows(prev =>
            prev.filter((_, i) => i !== index)
        );
    }


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
        handleRemoveRow,
        handleSaveOrders,

        workplaces: wpfetchHook.workplaces,

        paginationModel: prodPlan.paginationModel,
        handlePaginationChange: prodPlan.handlePaginationChange,
        totalCount: prodPlan.totalCount,

        open: dialog.open,
        openDialog: dialog.openDialog,
        closeDialog: dialog.closeDialog,
        submit: dialog.submit,
        deleteOrder: dialog.deleteOrder,

        handleProcessRowUpdate

    };


}