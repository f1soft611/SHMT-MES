import { useState} from "react";
import {useToast} from "../../../components/common/Feedback/ToastProvider";
import {ProductionResultOrder, ProductionResultDetail} from "../../../types/productionResult";
import {productionResultService} from "../../../services/productionResultService";

export function useProdResultDetail(parentRow: ProductionResultOrder) {
    const { showToast } = useToast();

    const [rows, setRows] = useState<ProductionResultDetail[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchDetails = async () => {
        setLoading(true);

        try {
            const response = await productionResultService.getProdResultDetails(parentRow);
            setRows(response.result?.resultList ?? []);
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
                WORKER: "",
                INPUTMATERIAL: "",

                TPR504ID: parentRow.TPR504ID,
                TPR601ID: parentRow.TPR601ID?? 'new',
                TPR601WID: 'new',
                TPR601MID: 'new',
            },
        ]);
    };

    const processRowUpdate = (newRow: ProductionResultDetail) => {
        setRows(prev =>
            prev.map(r => (r.id === newRow.id ? newRow : r))
        );
        return newRow;
    };

    const handleSave = async () => {
        const newRows = rows.filter(r => r.id.startsWith("NEW-"));

        if (newRows.length === 0) {
            showToast({
                message: "저장할 실적이 없습니다.",
                severity: "error"
            });
            return false;
        }

        try {
            await productionResultService.createProdResult(newRows);
            showToast({ message: "등록되었습니다.", severity: "success" });
            return true;
        } catch (e) {
            console.error(e);
            showToast({ message: "저장 중 오류가 발생했습니다.", severity: "error" });
            return false;
        }
    };

    // const handleSaveClick= async () => {
    //     const detailRows = rows.filter(r => r.id.startsWith("NEW-"));
    //
    //     if (detailRows.length === 0) {
    //         showToast({
    //             message: "저장할 실적이 없습니다.",
    //             severity: "error",
    //         });
    //         return;
    //     }
    //
    //     try {
    //         await productionResultService.createProdResult(detailRows);
    //         showToast({
    //             message: "등록되었습니다.",
    //             severity: 'success',
    //         });
    //     } catch (error){
    //         console.error(error);
    //         showToast({
    //             message: "저장 중 오류가 발생했습니다.",
    //             severity: "error",
    //         });
    //     }
    //
    //
    // };

    return {
        rows,
        setRows,
        addRow,
        loading,
        processRowUpdate,
        handleSave,
        fetchDetails
    };
}