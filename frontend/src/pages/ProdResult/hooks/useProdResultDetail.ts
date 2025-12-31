import {useEffect, useState} from "react";
import {useToast} from "../../../components/common/Feedback/ToastProvider";
import {ProductionResultOrder, ProductionResultDetail} from "../../../types/productionResult";
import {productionResultService} from "../../../services/productionResultService";
import workplaceService from "../../../services/workplaceService";
import {WorkplaceWorker} from "../../../types/workplace";

export function useProdResultDetail(parentRow: ProductionResultOrder) {
    const { showToast } = useToast();

    const [rows, setRows] = useState<ProductionResultDetail[]>([]);
    const [loading, setLoading] = useState(false);
    const [workplaceWorkers, setWorkplaceWorkers] = useState<WorkplaceWorker[]>([]);

    const normalizeRows = (rows: ProductionResultDetail[]) =>
        rows.map(r => ({
            ...r,
            WORKER:
                typeof r.WORKER === "string" && r.WORKER.length > 0
                    ? r.WORKER.split(",")
                    : [],
        }));

    const fetchDetails = async () => {
        setLoading(true);

        try {
            const response = await productionResultService.getProdResultDetails(parentRow);
            const list = response.result?.resultList ?? [];
            setRows(normalizeRows(list));
        } catch (e){
            console.log(e)
            showToast({
                message: "실적 상세 조회 중 오류가 발생했습니다.",
                severity: "error",
            });
        } finally {
            setLoading(false);
        }
    }

    const addRow = () => {
        setRows(prev => [
            ...prev,
            {
                id: `NEW-${Date.now()}`,
                FACTORY_CODE: parentRow.FACTORY_CODE,
                PRODPLAN_ID: parentRow.PRODPLAN_ID,
                PRODPLAN_DATE: parentRow.PRODPLAN_DATE,
                PRODPLAN_SEQ: parentRow.PRODPLAN_SEQ,
                PRODWORK_SEQ: parentRow.PRODWORK_SEQ,
                WORK_SEQ: parentRow.WORK_SEQ,
                PROD_SEQ: parentRow.PROD_SEQ,

                WORKDT_DATE: parentRow.WORKDT_DATE,
                PROD_STIME: "",
                PROD_ETIME: "",

                ITEM_CODE:parentRow.ITEM_CODE,
                WORK_CODE: parentRow.WORK_CODE,

                PROD_QTY: 0,
                GOOD_QTY: 0,
                BAD_QTY: 0,
                RCV_QTY: 0,
                ORDER_FLAG: parentRow.ORDER_FLAG,
                WORKER: [],
                INPUTMATERIAL: "",

                TPR504ID: parentRow.TPR504ID,
                TPR601ID: parentRow.TPR601ID?? `NEW-${Date.now()}`,
                TPR601WID: 'new',
                TPR601MID: 'new',
                __isModified: true,
            },
        ]);
    };

    const processRowUpdate = (newRow: ProductionResultDetail) => {
        setRows(prev =>
            prev.map(r =>
                r.TPR601ID === newRow.TPR601ID
                    ? { ...newRow, __isModified: true }
                    : r
            )
        );
        return newRow;
    };

    const handleSave = async () => {
        const newRows = rows.filter(r => r.TPR601ID.startsWith("NEW-"));
        const modifiedRows = rows.filter(
            r => !r.TPR601ID.startsWith("NEW-") && r.__isModified
        );

        if (newRows.length === 0 && modifiedRows.length === 0) {
            showToast({
                message: "저장할 변경사항이 없습니다.",
                severity: "info"
            });
            return false;
        }

        try {
            if (newRows.length > 0) {
                await productionResultService.createProdResult(newRows);

            }

            if (modifiedRows.length > 0) {
                await productionResultService.updateProdResult(modifiedRows);
            }

            showToast({ message: "등록되었습니다.", severity: "success" });

            // 플래그 초기화
            setRows(prev =>
                prev.map(r => ({
                    ...r,
                    __isModified: false,
                }))
            );

            return true;
        } catch (e) {
            console.error(e);
            showToast({ message: "저장 중 오류가 발생했습니다.", severity: "error" });
            return false;
        }
    };

    const handleDeleteRow = (row: ProductionResultDetail) => {
        // 신규 추가 행 → 바로 제거
        if (row.TPR601ID.startsWith("NEW-")) {
            setRows(prev => prev.filter(r => r.TPR601ID !== row.TPR601ID));
            return;
        }

        // 기존 행 → 확인
        if (!window.confirm("해당 실적을 삭제하시겠습니까?")) return;

        // // 실제 삭제는 저장 시 처리 → 여기서는 제거
        // setRows(prev => prev.filter(r => r.id !== row.id));
    };

    const fetchWorkers = async () => {
        try {
            const response = await workplaceService.getWorkplaceWorkers(parentRow.WORKCENTER_CODE);
            if (response.resultCode === 200) {
                setWorkplaceWorkers(response.result?.resultList ?? []);
            }
        } catch (error) {
            showToast({
                message: 'Failed to load workplace workers:'+error,
                severity: "error",
            });
            setWorkplaceWorkers([]);
        }
    };

    const workerOptions = workplaceWorkers.map(w => ({
        value: w.workerCode,
        label: w.workerName,
    }));

    useEffect(() => {
        if (!parentRow?.WORKCENTER_CODE) return;
        fetchWorkers();
    }, [parentRow.WORKCENTER_CODE]);

    return {
        rows,
        setRows,
        addRow,
        loading,
        processRowUpdate,
        handleSave,
        handleDeleteRow,
        fetchDetails,
        workerOptions
    };
}