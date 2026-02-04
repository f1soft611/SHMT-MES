
import {useProdPlan} from "./useProdPlan";
import {useProdOrder} from "./useProdOrder";
import {useProdOrderDialog} from "./useProdOrderDialog";
import {useFetchWorkplaces} from "../../../hooks/useFetchWorkplaces";
import { ProdPlanRow } from "../../../types/productionOrder";
import {useFetchEquipments} from "../../../hooks/useFetchEquipments";


export function useProductionOrder() {

    // 생산계획(메인그리드) 훅
    const prodPlan = useProdPlan();

    // 생산지시(dialog) 흑
    const prodOrder = useProdOrder();

    // 생산지시(dialog) 제어
    const dialog = useProdOrderDialog(
        // 저장처리
        async () => {
            const { changed } = await prodOrder.save();
            if (!changed) return;

            await prodPlan.fetchProdPlan();

            // if (prodOrder.selectedPlan) {
            //     const refreshed = prodPlan.planRows.find(
            //         p =>
            //             p.prodplanId === prodOrder.selectedPlan!.prodplanId &&
            //             p.prodplanSeq === prodOrder.selectedPlan!.prodplanSeq
            //     );
            //
            //     if (refreshed) {
            //         await prodOrder.selectPlan({
            //             ...refreshed,
            //             orderFlag: "ORDERED",
            //         });
            //     }
            // }
        },
        // 삭제처리
        async () => {
            const { deleted } = await prodOrder.remove();
            if (!deleted) return;

            await prodPlan.fetchProdPlan();
        }
    );

    // 작업장 조회
    const workplaces = useFetchWorkplaces();

    //  작업장 코드 기준 설비 자동 조회
    const { equipments } = useFetchEquipments(prodPlan.search.workplace);

    // 생산계획 row 선택
    const handlePlanSelect = (row: ProdPlanRow) => {
        prodOrder.selectPlan(row);
        dialog.openDialog();
    };


    return {
        // plan
        planRows: prodPlan.planRows,
        planLoading: prodPlan.loading,
        prodplanResultCnt: prodPlan.resultCnt,
        paginationModel: prodPlan.paginationModel,
        handlePaginationChange: prodPlan.handlePaginationChange,
        search: prodPlan.search,
        handleSearch: prodPlan.handleSearch,
        handleSearchChange: prodPlan.handleSearchChange,

        // order
        selectedPlan: prodOrder.selectedPlan,
        localRows: prodOrder.orderRows,
        orderResultCnt: prodOrder.orderResultCnt,
        orderLoading: prodOrder.loading,
        orderError: prodOrder.error,
        // order event
        handleAddRow: prodOrder.addRow,
        handleRemoveRow: prodOrder.removeRow,
        handleProcessRowUpdate: prodOrder.updateRow,

        // dialog
        open: dialog.open,
        openDialog: dialog.openDialog,
        closeDialog: dialog.closeDialog,
        submit: dialog.submit,
        deleteOrder: dialog.deleteOrder,

        // 작업장, 설비
        workplaces: workplaces.workplaces,
        equipments,

        // event
        handlePlanSelect,
    };


}