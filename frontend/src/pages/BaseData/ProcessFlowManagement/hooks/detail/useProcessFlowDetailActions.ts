import processFlowService from '../../../../../services/processFlowService';
import {DetailSavePayload, DetailSaveResult, ProcessFlow, ProcessFlowItem, ProcessFlowProcess} from "../../../../../types/processFlow";

export function useProcessFlowDetailActions(selectedFlow: ProcessFlow | null) {

    // 공정 흐름별 공정/제품 저장 및 수정
    const handleDetailSave = async ({
                                        processes,
                                        items,
                                    }: DetailSavePayload): Promise<DetailSaveResult> => {

        // selectedFlow가 반드시 있어야 저장 가능
        if (!selectedFlow?.processFlowId) {
            return { ok: false, reason: "선택한 공정흐름이 없음" };
        }

        try {
            // 공정 저장
            if (processes !== undefined) {

                // seq 검사
                const hasEmptySeq = processes.some(
                    (p) => !p.seq || p.seq.trim() === ""
                );
                if (hasEmptySeq) {
                    return { ok: false, reason: "공정 순서를 입력해주세요" };
                }

                // 설비연동 중복 검사
                const linkedCnt = processes.filter(
                    (p) => p.equipmentFlag === "Y"
                ).length;
                if (linkedCnt > 1) {
                    return { ok: false, reason: "연동된 공정은 한 개만 등록 가능합니다" };
                }

                // UI 전용 flowRowId 제거 + DTO 변환
                const processList = processes.map((p: ProcessFlowProcess) => ({
                    flowProcessId: p.flowProcessId ?? null,
                    flowProcessCode: p.flowProcessCode,
                    processFlowId: selectedFlow.processFlowId,
                    processFlowCode: selectedFlow.processFlowCode,
                    seq: p.seq,
                    processSeq: p.processSeq,
                    lastFlag: p.lastFlag,
                }));

                await processFlowService.createFlowProcesses(
                    selectedFlow.processFlowId,
                    processList
                );
            }

            // 품목 저장
            if (items !== undefined) {
                const itemList = items.map((it: ProcessFlowItem) => ({
                    flowItemId: it.flowItemId ?? null,
                    flowItemCode: it.flowItemCode,
                    flowItemCodeId: it.flowItemCodeId,
                    flowItemName: it.flowItemName,
                    specification: it.specification,
                    unit: it.unit,
                    processFlowId: selectedFlow.processFlowId,
                    processFlowCode: selectedFlow.processFlowCode,
                }));

                await processFlowService.createFlowItems(
                    selectedFlow.processFlowId,
                    itemList
                );
            }

            return { ok: true, reason: "저장 성공" };
        } catch (e) {
            console.error(e);
            return { ok: false, reason: "저장 실패" };
        }
    };

    return {
        handleDetailSave,
    };
}