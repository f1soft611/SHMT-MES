
import { useState } from 'react';
import {useProdPlan} from "./useProdPlan";
import {useProdOrder} from "./useProdOrder";
import {useProdOrderDialog} from "./useProdOrderDialog";
import {useFetchWorkplaces} from "../../../hooks/useFetchWorkplaces";
import {ProdPlanKeyDto, ProdPlanRow} from "../../../types/productionOrder";
import {useFetchEquipments} from "../../../hooks/useFetchEquipments";
import { useToast } from '../../../components/common/Feedback/ToastProvider';
import { productionOrderService } from '../../../services/productionOrderService';
import { useProdOrderStore } from '../store/useProdOrderStore';


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

    const { showToast } = useToast();
    const [erpIfLoading, setErpIfLoading] = useState(false);

    const handleErpIfResend = async () => {
        const selectedRows = useProdOrderStore.getState().selectedRows;

        const targets = selectedRows.filter(row => row.orderFlag === 'ORDERED');

        if (targets.length === 0) {
            showToast({ message: '지시완료 상태인 항목을 선택해주세요.', severity: 'warning' });
            return;
        }

        const payload = targets.map(row => ({
            prodplanId: row.prodplanId,
            prodplanDate: row.prodplanDate,
            prodplanSeq: row.prodplanSeq,
            prodworkSeq: row.prodworkSeq,
            prodplanDetailId: row.prodplanDetailId,

            orderSeqno: row.orderSeqno ?? 0,
            orderHistno: row.orderHistno ?? 0,
        }));

        try {
            setErpIfLoading(true);
            const response = await productionOrderService.resendErpIf(payload);
            if (response.data.resultCode !== 200) {
                showToast({ message: response.data.resultMessage ?? '전송 실패', severity: 'error' });
                return;
            }
            showToast({
                message: response.data.resultMessage ?? 'ERP IF 전송 완료',
                severity: 'success',
            });
            await prodPlan.fetchProdPlan();
        } catch {
            showToast({ message: '서버 오류가 발생했습니다.', severity: 'error' });
        } finally {
            setErpIfLoading(false);
        }
    };


    const handleSyncErpResult = async () => {
        const selectedRows = useProdOrderStore.getState().selectedRows;

        if (selectedRows.length === 0) {
            showToast({ message: '동기화할 항목을 선택해주세요.', severity: 'warning' });
            return;
        }

        const payload: ProdPlanKeyDto[] = selectedRows.map(row => ({
            prodplanId: row.prodplanId,
            prodplanDate: row.prodplanDate,
            prodplanSeq: row.prodplanSeq,
            prodworkSeq: row.prodworkSeq,
            prodplanDetailId: row.prodplanDetailId,
            orderSeqno: row.orderSeqno ?? 0,
            orderHistno: row.orderHistno ?? 0,
        }));

        try {
            setErpIfLoading(true);
            const response = await productionOrderService.syncErpResult(payload);
            if (response.data.resultCode !== 200) {
                showToast({ message: response.data.resultMessage ?? '동기화 실패', severity: 'error' });
                return;
            }
            showToast({
                message: response.data.resultMessage ?? 'ERP 결과 동기화 완료',
                severity: 'success',
            });
            await prodPlan.fetchProdPlan();
        } catch {
            showToast({ message: '서버 오류가 발생했습니다.', severity: 'error' });
        } finally {
            setErpIfLoading(false);
        }
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
        fetchProdPlan: prodPlan.fetchProdPlan,

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
        handleErpIfResend,
        handleSyncErpResult,
        erpIfLoading,
    };


}