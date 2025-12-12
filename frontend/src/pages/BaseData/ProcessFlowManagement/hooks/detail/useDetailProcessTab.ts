import React, {useMemo, useState} from 'react';
import {GridPaginationModel, GridRowId, GridRowModel} from "@mui/x-data-grid";
import { useToast } from '../../../../../components/common/Feedback/ToastProvider';
import {ProcessFlow, ProcessFlowProcess} from "../../../../../types/processFlow";
import {Process} from "../../../../../types/process";

export function useDetailProcessTab(
    selectedFlow: ProcessFlow | null,
    processRows: Process[],
    flowProcessRows: ProcessFlowProcess[],
    setFlowProcessRows: React.Dispatch<React.SetStateAction<ProcessFlowProcess[]>>
) {

    const { showToast } = useToast();

    const [processPagination, setProcessPagination] = useState<GridPaginationModel>({
        page: 0,
        pageSize: 10,
    });

    /** 검색 상태 */
    const [inputValues, setInputValues] = useState({
        searchCnd: "0",
        searchWrd: "",
    });

    const [searchParams, setSearchParams] = useState({
        searchCnd: "0",
        searchWrd: "",
    });

    const handleInputChange = (field: string, value: string) => {
        setInputValues(prev => ({ ...prev, [field]: value }));
    };

    /** 검색 필터 적용 */
    const filteredRows = useMemo(() => {
        const { searchCnd, searchWrd } = inputValues;

        if (!searchWrd.trim()) return processRows;

        const kw = searchWrd.toLowerCase();

        return processRows.filter(p => {
            if (searchCnd === "0") return p.processCode.toLowerCase().includes(kw);
            return p.processName.toLowerCase().includes(kw);
        });
    }, [inputValues, processRows]);


    // 검색 실행
    const handleSearch = () => {
        setSearchParams(inputValues);
        setProcessPagination(prev => ({ ...prev, page: 0 }));
    };


    /** 선택 관리 */
    const [leftSelected, setLeftSelected] = useState<GridRowId[]>([]);
    const [rightSelected, setRightSelected] = useState<GridRowId[]>([]);
    const [lastProcessId, setLastProcessId] = useState<string | null>(null);



    /** 오른쪽으로 추가 */
    const addProcess = () => {
        if (leftSelected.length === 0 || !selectedFlow) return;

        // 현재 flowProcessRows 중 Y 개수
        const currentLinked = flowProcessRows.filter(p => p.equipmentFlag === "Y").length;

        // 왼쪽에서 선택된 공정 중 설비연동(Y) 개수
        const selectedLeftLinked = processRows
        .filter(p => leftSelected.includes(p.processCode))
        .filter(p => p.equipmentIntegrationYn === "Y").length;

        if (currentLinked + selectedLeftLinked > 1) {
            showToast?.({
                message: "설비 연동 공정은 하나만 추가할 수 있습니다.",
                severity: "error",
                durationMs: 2500,
            });
            return;
        }

        const newRows: ProcessFlowProcess[] = processRows
        .filter(p => leftSelected.includes(p.processCode))
        .map(p => ({
            flowRowId: crypto.randomUUID(),
            flowProcessId: null,

            seq: "",
            processFlowCode: selectedFlow.processFlowCode ?? "",
            processFlowId: selectedFlow.processFlowId ?? "",
            equipmentFlag: p.equipmentIntegrationYn ?? "N",
            lastFlag: "N",

            flowProcessCode: p.processCode,
            flowProcessName: p.processName,
            processSeq: String(p.sortOrder ?? "")
        }));

        setFlowProcessRows(prev => [...prev, ...newRows]);
        setLeftSelected([]);
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

    /** 탭 초기화 */
    const clearProcessTab = () => {
        setLeftSelected([]);
        setRightSelected([]);

        setLastProcessId(null);

        setInputValues({ searchCnd: "0", searchWrd: "" });
        setSearchParams({ searchCnd: "0", searchWrd: "" });
        setProcessPagination({ page: 0, pageSize: 10 });
    };


    return {
        /** 검색 */
        inputValues,
        handleInputChange,
        handleSearch,
        filteredRows,

        /** 리스트 */
        flowProcessRows,
        setFlowProcessRows,

        /** 선택 */
        leftSelected,
        setLeftSelected,
        rightSelected,
        setRightSelected,

        lastProcessId,
        setLastProcessId,

        /** 이동 */
        addProcess,
        removeProcess,

        /** 수정 */
        updateProcessRow,
        selectLastProcess,

        clearProcessTab,
    };

}