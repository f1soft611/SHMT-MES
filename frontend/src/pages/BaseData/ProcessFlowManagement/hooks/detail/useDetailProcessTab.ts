import React, { useState} from 'react';
import { GridRowId, GridRowModel} from "@mui/x-data-grid";
import { useToast } from '../../../../../components/common/Feedback/ToastProvider';
import { ProcessFlowProcess} from "../../../../../types/processFlow";
import {Process} from "../../../../../types/process";

interface Props {
    flowProcessRows: ProcessFlowProcess[];
    setFlowProcessRows: React.Dispatch<React.SetStateAction<ProcessFlowProcess[]>>;
}

export function useDetailProcessTab({
    flowProcessRows,
    setFlowProcessRows,
}: Props) {

    const { showToast } = useToast();


    /** 선택 관리 */
    const [rightSelected, setRightSelected] = useState<GridRowId[]>([]);
    const [lastProcessId, setLastProcessId] = useState<string | null>(null);



    /** 오른쪽으로 추가 */
    const addProcess = (
        selectedLeft: GridRowId[],
        processRows: Process[],
        processFlowId: string,
        processFlowCode: string
    ) => {
        if (selectedLeft.length === 0) return;

        // 이미 등록된 설비연동(Y) 개수
        const currentLinked = flowProcessRows.filter(
            (p) => p.equipmentFlag === "Y"
        ).length;

        // 왼쪽에서 선택된 공정 중 설비연동(Y) 개수
        const selectedLeftLinked = processRows
        .filter((p) => selectedLeft.includes(p.processCode))
        .filter((p) => p.equipmentIntegrationYn === "Y").length;

        if (currentLinked + selectedLeftLinked > 1) {
            showToast?.({
                message: "설비 연동 공정은 하나만 추가할 수 있습니다.",
                severity: "error",
                durationMs: 2500,
            });
            return;
        }

        setFlowProcessRows((prev) => {
            const existCodes = new Set(prev.map((p) => p.flowProcessCode));

            const newRows: ProcessFlowProcess[] = processRows
            .filter((p) => selectedLeft.includes(p.processCode))
            .filter((p) => !existCodes.has(p.processCode))
            .map((p) => ({
                flowRowId: crypto.randomUUID(),
                flowProcessId: null,

                processFlowId,
                processFlowCode,

                flowProcessCode: p.processCode,
                flowProcessName: p.processName,

                equipmentFlag: p.equipmentIntegrationYn ?? "N",
                lastFlag: "N",
                seq: "",
                processSeq: String(p.sortOrder ?? ""),
            }));

            return [...prev, ...newRows];
        });
    };

    /** 오른쪽 목록 삭제 */
    const removeProcess = () => {
        if (rightSelected.length === 0) return;
        setFlowProcessRows(prev =>
            prev.filter(p => !rightSelected.includes(p.flowProcessId ?? p.flowRowId))
        );

        setRightSelected([]);
    };

    /** -----------------------------
     *  seq, lastFlag 등 업데이트
     * ------------------------------*/
    const updateProcessRow = (newRow: GridRowModel, oldRow: GridRowModel): GridRowModel => {
        setFlowProcessRows(prev => {
            const updated = prev.map(p =>
                (p.flowProcessId ?? p.flowRowId) === (newRow.flowProcessId ?? newRow.flowRowId)
                    ? { ...p, seq: newRow.seq }
                    : p
            );

            return [...updated].sort((a, b) => {
                const sa = a.seq ? Number(a.seq) : null;
                const sb = b.seq ? Number(b.seq) : null;

                if (sa === null && sb === null) return 0;
                if (sa === null) return 1;
                if (sb === null) return -1;

                return sa - sb;
            });
        });

        return newRow;
    };

    // lastFlag 라디오 선택
    const selectLastProcess = (rid: string) => {
        setFlowProcessRows(prev =>
            prev.map(p =>
                (p.flowProcessId ?? p.flowRowId) === rid
                    ? { ...p, lastFlag: "Y" }
                    : { ...p, lastFlag: "N" }
            )
        );
        setLastProcessId(rid);
    };




    return {
        rightSelected,
        setRightSelected,
        lastProcessId,

        addProcess,
        removeProcess,
        updateProcessRow,
        selectLastProcess,
    };

}