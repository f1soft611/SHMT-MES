import {useCallback, useEffect, useState} from "react";
import {GridPaginationModel} from "@mui/x-data-grid";
import {ProcessFlow, ProcessFlowItem, ProcessFlowProcess, DetailSavePayload, DetailSaveResult } from "../../../../types/processFlow";
import processFlowService from "../../../../services/processFlowService";

export function useProcessFlow() {

    const [rows, setRows] = useState<ProcessFlow[]>([]);
    const [selectedFlow, setSelectedFlow] = useState<ProcessFlow | null>(null);
    const [detailTab, setDetailTab] = useState(0);

    // 공정 흐름 dialog
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');

    // 공통 dialog
    const [openDetailDialog, setOpenDetailDialog] = useState(false);

    // 페이지네이션
    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
        page: 0,
        pageSize: 10,
    });


    // 실제 검색에 사용되는 파라미터
    const [searchParams, setSearchParams] = useState({
        searchCnd: '1',
        searchWrd: '',
        status: '',
    });

    // 입력 필드용 상태 (화면 입력용)
    const [inputValues, setInputValues] = useState({
        searchCnd: '1',
        searchWrd: '',
        status: '',
    });

    // 입력 변경 처리
    const handleInputChange = (field: string, value: string) => {
        setInputValues(prev => ({ ...prev, [field]: value }));
    };

    // 검색 실행 (입력값 → 검색 파라미터 복사 + 페이지 초기화)
    const handleSearch = () => {
        setSearchParams({ ...inputValues });
        setPaginationModel(prev => ({ ...prev, page: 0 }));

        // 조회 실행
        fetchProcessFlows(0, paginationModel.pageSize, {
            ...inputValues
        });

    };

    const fetchProcessFlows = useCallback(async (page = paginationModel.page,
                                                 pageSize = paginationModel.pageSize,
                                                 params = searchParams) => {
        try {
            const response = await processFlowService.getProcessFlowList(
                paginationModel.page,
                paginationModel.pageSize,
                searchParams
            );
            if (response.resultCode === 200 && response.result?.resultList) {
                setRows(response.result.resultList);
            }
        } catch (error) {
            console.error(error);
            return false;
        }
    }, [searchParams, paginationModel]);

    // 목록 재조회
    useEffect(() => {
        fetchProcessFlows();
    }, [fetchProcessFlows]);


    // 신규 등록 Dialog 열기
    const handleOpenCreateDialog = () => {
        setDialogMode("create");
        setSelectedFlow(null);       // 빈 값 전달
        setOpenDialog(true);
    };

    // 수정 Dialog 열기
    const handleOpenEditDialog = (row: ProcessFlow) => {
        setDialogMode('edit');
        setSelectedFlow(row);        // 선택된 데이터 전달
        setOpenDialog(true);
    };

    // dialog 닫기
    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    // detail Dialog 열기
    const handleOpenDetailDialog = (row: ProcessFlow, tabIndex: number) => {
        setSelectedFlow(row);
        setDetailTab(tabIndex);
        setOpenDetailDialog(true);
    };

    // detail Dialog 닫기
    const handleCloseDetailDialog = () => {
        setOpenDetailDialog(false);
    };


    // 저장 (폼 제출 후 호출됨)
    const handleSave = async (data: ProcessFlow) => {
        try {
            if (dialogMode === "create") {
                const result = await processFlowService.createProcessFlow(data);
                return true;
            } else {
                await processFlowService.updateProcessFlow(data.processFlowId!, data);
                return false;
            }

            handleCloseDialog();
            fetchProcessFlows();  // 목록 새로고침
        } catch (error) {
            console.error(error);
            return false;
        }
    };

    // 삭제
    const handleDelete = async (id: string) => {
        if (!window.confirm("정말 삭제하시겠습니까?")) return;

        try {
            await processFlowService.deleteProcessFlow(id);
            fetchProcessFlows();
        } catch (error) {
            console.error("삭제 실패:", error);
        }
    };


    // 공정 흐름별 공정/제품 저장 및 수정
    const handleDetailSave = async ({ processes, items }: DetailSavePayload): Promise<DetailSaveResult> => {

        // selectedFlow가 반드시 있어야 저장 가능
        if (!selectedFlow?.processFlowId) {
            return { ok: false, reason: "선택한 공정흐름이 없음" };
        }

        try {
            // 공정 저장 요청일 때
            if (processes !== undefined) {

                // seq 검사
                const hasEmptySeq = processes.some(p => !p.seq || p.seq.trim() === "");
                if (hasEmptySeq) {
                    return { ok: false, reason: "공정 순서를 입력해주세요" };
                }

                // 설비연동 중복 검사
                const linkedCnt = processes.filter(p => p.equipmentFlag === "Y").length;
                if (linkedCnt > 1) {
                    return { ok: false, reason: "연동된 공정은 한 개만 등록 가능합니다" };
                }

                // UI 전용 flowRowId 제거 + DTO 변환
                const processList = processes.map((p: ProcessFlowProcess) => ({
                    flowProcessId: p.flowProcessId ?? null,
                    flowProcessCode: p.flowProcessCode,
                    processFlowId: selectedFlow.processFlowId,   // 여기 고정
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

            // 품목 저장 요청일 때
            if (items !== undefined) {
                const itemList = items.map((it: ProcessFlowItem) => ({
                    flowItemId: it.flowItemId ?? null,
                    flowItemCode: it.flowItemCode,
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
            return { ok: false, reason: "저장 실패" };
        }
    };




    return {
        // 목록
        rows,
        selectedFlow,

        // 입력 & 검색
        inputValues,
        handleInputChange,
        setInputValues,
        searchParams,
        setSearchParams,
        handleSearch,

        // 페이지네이션
        paginationModel,
        setPaginationModel,

        // Dialog 조작
        openDialog,
        dialogMode,
        openDetailDialog,
        handleOpenDetailDialog,
        handleCloseDetailDialog,
        handleOpenCreateDialog,
        handleOpenEditDialog,
        handleCloseDialog,
        detailTab,

        // CRUD
        fetchProcessFlows,
        handleSave,
        handleDelete,

        handleDetailSave,
    };
}

