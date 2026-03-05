import { useState } from "react";
import { useToast } from "../../../components/common/Feedback/ToastProvider";
import { ProdPlanKeyDto, ProdPlanRow } from "../../../types/productionOrder";
import { productionOrderService } from "../../../services/productionOrderService";

export function useBulkProdOrder(
    selectedRows: ProdPlanRow[],
    clear: () => void,
    onReload: () => void
) {
    const { showToast } = useToast();
    const [bulkLoading, setBulkLoading] = useState(false);

    const handleBulkOrder = async () => {
        if (selectedRows.length === 0) return;

        const targets = selectedRows.filter(
            row => row.orderFlag !== 'ORDERED'
        );

        if (targets.length === 0) return;

        const payload: ProdPlanKeyDto[] = targets.map(row => ({
            prodplanId: row.prodplanId,
            prodplanDate: row.prodplanDate,
            prodplanSeq: row.prodplanSeq,
            prodworkSeq: row.prodworkSeq,
        }));

        try {
            setBulkLoading(true);
            const response = await productionOrderService.bulkCreateProductionOrders(payload);
            if (response.data.resultCode !== 200){
                showToast({
                    message: response.data.resultMessage ?? "저장 실패",
                    severity: "error",
                });
                return;
            }

            showToast({
                message: response.data.resultMessage ?? "저장 성공",
                severity: "success",
            });
            clear();
            onReload();
        } catch (e){
            showToast({
                message: "서버 오류가 발생했습니다.",
                severity: "error",
            });
        } finally {
            setBulkLoading(false);
        }


    };


    // 일괄 취소
    const handleBulkCancel = async () => {
        // 이미 지시된 것만 취소 대상
        const targets = selectedRows.filter(
            row => row.orderFlag === 'ORDERED'
        );

        if (targets.length === 0) {
            showToast({
                message: "취소할 생산지시가 없습니다.",
                severity: "warning",
            });
            clear();
            return;
        }

        // console.log(targets);

        const payload: ProdPlanKeyDto[] = targets.map(row => ({
            prodplanId: row.prodplanId,
            prodplanDate: row.prodplanDate,
            prodplanSeq: row.prodplanSeq,
            prodworkSeq: row.prodworkSeq,
        }));

        try {
            setBulkLoading(true);
            const response = await productionOrderService.bulkCancelProductionOrders(payload);

            if (response.data.resultCode !== 200) {
                showToast({
                    message: response.data.resultMessage ?? "취소 실패",
                    severity: "error",
                });
                return;
            }

            showToast({
                message: response.data.resultMessage ?? "취소 성공",
                severity: "success",
            });

            clear();
            onReload();
        } catch (e) {
            showToast({
                message: "서버 오류가 발생했습니다.",
                severity: "error",
            });
        } finally {
            setBulkLoading(false);
        }

    }

    return {
        handleBulkOrder,
        handleBulkCancel,
        bulkLoading
    };
}