import {ProcessFlow} from "../../../../../types/processFlow";
import processFlowService from "../../../../../services/processFlowService";

export function useProcessFlowMainActions(fetchList: () => void, closeDialog: () => void) {
    const handleSave = async (data: ProcessFlow, mode: "create" | "edit") => {
        // console.log("[MainActions] handleSave called:", mode, data);
        try {
            if (mode === "create") {
                await processFlowService.createProcessFlow(data);
            } else {
                if (!data.processFlowId) throw new Error("processFlowId 없음");
                await processFlowService.updateProcessFlow(data.processFlowId, data);
            }

            closeDialog();
            fetchList();
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("정말 삭제하시겠습니까?")) return false;

        try {
            await processFlowService.deleteProcessFlow(id);
            fetchList();
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    };

    return { handleSave, handleDelete };

}