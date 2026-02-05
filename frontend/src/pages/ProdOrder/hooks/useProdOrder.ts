import { useState} from "react";
import {productionOrderService} from "../../../services/productionOrderService";
import {
    ProdOrderInsertDto,
    ProdOrderRow,
    ProdOrderUpdateDto,
    ProdPlanRow
} from "../../../types/productionOrder";
import {useToast} from "../../../components/common/Feedback/ToastProvider";


export function useProdOrder() {


    const { showToast } = useToast();

    // 위 그리드 선택된 생산계획
    const [selectedPlan, setSelectedPlan] = useState<ProdPlanRow | null>(null);

    // 생산지시 로컬 그리드 데이터
    const [localRows, setLocalRows] = useState<ProdOrderRow[]>([]);
    const [resultCnt, setResultCnt] = useState(0);

    // 상태관리
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 생산계획 선택
    const selectPlan = async (plan: ProdPlanRow) => {
        setSelectedPlan(plan);
        await fetchProdOrders(plan);
    };


    /** ======================
     *  신규 저장 DTO 변환
     *  ====================== */
    const toInsertDto = (row: ProdOrderRow, seq: number): ProdOrderInsertDto => ({
        prodplanDate: row.prodplanDate,
        prodplanSeq: row.prodplanSeq,
        prodworkSeq: row.prodworkSeq,

        prodplanId: row.prodplanId,
        newWorkorderSeq: seq,

        workCode: row.workCode,
        workdtDate: row.workdtDate,

        itemCodeId: row.itemCodeId,
        prodCodeId: row.prodCodeId,
        equipmentCode: row.equipmentCode,

        lotNo: row.lotNo,
        orderQty: row.orderQty,
        bigo: row.bigo,
    });


    /** ======================
     *  수정 DTO 변환
     *  ====================== */
    const toUpdateDto = (row: ProdOrderRow, seq: number): ProdOrderUpdateDto => ({
        prodplanDate: row.prodplanDate,
        prodplanSeq: row.prodplanSeq,
        prodworkSeq: row.prodworkSeq,
        orderSeq: row.orderSeq,

        workdtDate: row.workdtDate,
        orderQty: row.orderQty,
        newWorkorderSeq: seq,

        bigo: row.bigo,
    });

    /** ======================
     *  생산지시 조회
     *  - PLANNED  : 공정 흐름 기준 조회
     *  - ORDERED  : 실제 생산지시 조회
     *  ====================== */
    const fetchProdOrders = async (plan: ProdPlanRow) => {
        try {
            setLoading(true);
            setError(null);

            const status: string = plan.orderFlag ?? "ORDERED";

            const data =
                status === "PLANNED"
                    ? await productionOrderService.getFlowProcessByPlanId(plan)
                    : await productionOrderService.getProdOrdersByPlanId(plan);

            if (data.resultCode !== 200){
                showToast({ message: data.resultMessage, severity: 'error' });
                return;
            }

            setLocalRows(
                (data.result?.resultList ?? []).map(r => ({
                    ...r,
                    _isNew: false,
                }))
            );
            setResultCnt(data.result?.resultCnt ?? 0);
        } catch (err: any) {
            setError(err.message || "생산지시 조회 실패");
            setLocalRows([]);
            setResultCnt(0);
        } finally {
            setLoading(false);
        }
    };

    /** ======================
     *  생산지시 저장
     *  - 신규(insert)
     *  - 수정(update)
     *  ====================== */
    const save: () => Promise<{ changed: boolean }> = async () => {
        try {

            const indexed = localRows.map((row, i) => ({
                row,
                seq: i + 1,
            }));

            const insertRows: ProdOrderInsertDto[] = indexed
            .filter(({ row }) => row._isNew || !row.prodorderId)
            .map(({ row, seq }) => toInsertDto(row, seq));

            const updateRows: ProdOrderUpdateDto[] = indexed
            .filter(({ row }) => !row._isNew && row.prodorderId)
            .map(({ row, seq }) => toUpdateDto(row, seq));

            let changed = false;
            let lastMessage = "저장되었습니다";

            // 수정row
            if (updateRows.length > 0) {
                const { data } = await productionOrderService.updateProductionOrder(updateRows);
                if (data.resultCode !== 200) {
                    showToast({ message: data.resultMessage, severity: "error" });
                    return { changed: false };
                }
                lastMessage = data.resultMessage;
                changed = true;
            }

            // 신규 row
            if (insertRows.length > 0) {
                const { data } = await productionOrderService.createProductionOrder(insertRows);
                if (data.resultCode !== 200) {
                    showToast({ message: data.resultMessage, severity: "error" });
                    return { changed: false };
                }
                lastMessage = data.resultMessage;
                changed = true;
            }

            showToast({
                message: lastMessage,
                severity: "success",
            });
            return { changed };

        } catch (e) {
            console.log(e);
            showToast({
                message: "저장 실패",
                severity: "error",
            });
            return { changed: false };
        }
    };


    /** ======================
     *  생산지시 삭제
     *  ====================== */
    const remove: () => Promise<{ deleted: boolean }> = async () => {
        if (!selectedPlan) return { deleted: false };
        try {
            const deleteDto = {
                prodplanDate: selectedPlan.prodplanDate,
                prodplanSeq: selectedPlan.prodplanSeq,
                prodworkSeq: selectedPlan.prodworkSeq,
            };

            const { data } = await productionOrderService.deleteProductionOrders(deleteDto);
            if (data.resultCode !== 200) {
                showToast({
                    message: data.resultMessage,
                    severity: "error",
                });
                return { deleted: false };
            }

            showToast({
                message: data.resultMessage,
                severity: "success",
            });
            return { deleted: true };

        } catch (e) {
            console.log(e)
            showToast({
                message: "삭제 요청 중 오류가 발생했습니다.",
                severity: "error",
            });
            return { deleted: false };
        }

    }

    /** ======================
     *  행 분할 (신규 행 추가)
     *  ====================== */
    const handleAddRow = (index: number) => {
        setLocalRows(prev => {
            const base = prev[index];   // 분할 기준 행

            const newRow = {
                ...base, // 전체 행 복사
                prodorderId: '',
                orderSeq: 0,
                workorderSeq: 0,
                idx: crypto.randomUUID(),
                _isNew: true,
            };

            const copy = [...prev];
            copy.splice(index + 1, 0, newRow);
            return copy;
        });
    };

    /** ======================
     *  행 삭제 (로컬)
     *  ====================== */
    const handleRemoveRow  = (index: number) => {
        setLocalRows(prev =>
            prev.filter((_, i) => i !== index)
        );
    }

    /** ======================
     *  셀 수정 반영
     *  ====================== */
    const handleProcessRowUpdate = (newRow: ProdOrderRow) => {
        setLocalRows((prev) =>
            prev.map((r) => (r.idx === newRow.idx ? newRow : r))
        );
        return newRow;
    };


    return {
        selectedPlan,

        orderRows: localRows,
        orderResultCnt: resultCnt,
        loading,
        error,

        selectPlan,
        fetchProdOrders,

        save,
        remove,

        addRow: handleAddRow,
        removeRow: handleRemoveRow,
        updateRow: handleProcessRowUpdate,
    };
}