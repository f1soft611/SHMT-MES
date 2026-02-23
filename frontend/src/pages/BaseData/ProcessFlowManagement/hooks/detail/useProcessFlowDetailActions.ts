import processFlowService from '../../../../../services/processFlowService';
import {DetailSavePayload, DetailSaveResult, ProcessFlow, ProcessFlowItem, ProcessFlowProcess} from "../../../../../types/processFlow";
import {useState} from "react";

export function useProcessFlowDetailActions(selectedFlow: ProcessFlow | null) {

    const [loading, setLoading] = useState(false);

    // 공정 흐름별 공정/제품 저장 및 수정
    const handleDetailSave = async (
        payload: DetailSavePayload
    ): Promise<DetailSaveResult> => {

        // selectedFlow가 반드시 있어야 저장 가능
        if (!selectedFlow?.processFlowId) {
            return { ok: false, reason: "선택한 공정흐름이 없음" };
        }
        setLoading(true);

        try {
            // 공정 저장
            if ("processes" in payload) {
                const processes = payload.processes;
                // seq 검사
                const hasEmptySeq = processes.some(
                    (p) => p.seq === null || p.seq === undefined
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

                const {data} = await processFlowService.createFlowProcesses(
                    selectedFlow.processFlowId,
                    processList
                );

                if (data.resultCode !== 200){
                    return {ok: false, reason: data.resultMessage};
                }
            }

            // 품목 저장
            if ("items" in payload) {
                const items = payload.items;

                // ✅ 신규 항목만 추림
                const newItems = items.filter(
                    (it: ProcessFlowItem) => it.flowItemId?.startsWith('new-')
                );

                // 신규가 없으면 저장 API 호출 안 함
                if (newItems.length === 0) {
                    return { ok: true };
                }

                const itemList = newItems.map((it: ProcessFlowItem) => ({
                    flowItemId:  null,
                    flowItemCode: it.flowItemCode,
                    flowItemCodeId: it.flowItemCodeId,
                    flowItemName: it.flowItemName,
                    specification: it.specification,
                    unit: it.unit,
                    processFlowId: selectedFlow.processFlowId,
                    processFlowCode: selectedFlow.processFlowCode,
                }));

                const { data } = await processFlowService.createFlowItems(
                    selectedFlow.processFlowId,
                    itemList
                );

                if (data.resultCode !== 200){
                    return {ok: false, reason: data.resultMessage};
                }
            }

            return { ok: true, reason: "저장 성공" };
        } catch (e) {
            console.error(e);
            return { ok: false, reason: "저장 실패" };
        } finally {
            setLoading(false);
        }
    };

    return {
        handleDetailSave,
        loading
    };
}