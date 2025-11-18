import {useCallback, useEffect, useState} from "react";
import {GridPaginationModel} from "@mui/x-data-grid";
import { useForm } from "react-hook-form";
import {ProcessFlow, ProcessFlowItem} from "../../../../types/processFlow";
import {yupResolver} from "@hookform/resolvers/yup";
import { processFlowSchema } from "../processFlowSchema";
import processFlowService from "../../../../services/processFlowService";
import itemService from "../../../../services/itemService";

export function useProcessFlow() {

    const [rows, setRows] = useState<ProcessFlow[]>([]);
    const [selectedFlow, setSelectedFlow] = useState<ProcessFlow | null>(null);

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
    };

    const fetchProcessFlows = useCallback(async () => {
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
            showSnackbar("조회 실패", "error");
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
    const handleOpenDetailDialog = (row: ProcessFlow) => {
        setSelectedFlow(row);
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
                showSnackbar("공정흐름이 등록되었습니다.", "success");
            } else {
                await processFlowService.updateProcessFlow(data.processFlowId!, data);
                showSnackbar("공정흐름이 수정되었습니다.", "success");
            }

            handleCloseDialog();
            fetchProcessFlows();  // 목록 새로고침
        } catch (error) {
            console.error(error);
            showSnackbar("저장 실패", "error");
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


    // Snackbar 상태
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: "success" | "error";
    }>({
        open: false,
        message: "",
        severity: "success",
    });

    const showSnackbar = (message: string, severity: "success" | "error") => {
        setSnackbar({
            open: true,
            message,
            severity,
        });
    };

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
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

        // CRUD
        fetchProcessFlows,
        handleSave,
        handleDelete,

        // Snackbar
        snackbar,
        showSnackbar,
        handleCloseSnackbar,
    };
}


// const [flowProcessRows, setFlowProcessRows] = useState([]);
// const [flowItemRows, setFlowItemRows] = useState([]);
//
// const [processRows, setProcessRows] = useState([]);
// const [itemRows, setItemRows] = useState([]);

// 공정흐름별 공정

// 공정흐름별 제품
// const [openItemDialog, setOpenItemDialog] = useState(false);
// const [itemDialogMode, setItemDialogMode] = useState<"create" | "edit">("create");

// // react-hook-form 설정 - 공정흐름별 제품
// const {
//     control: itemControl,
//     handleSubmit: handleItemSubmit,
//     reset: resetItemForm,
//     formState: { errors: itemErrors }
// } = useForm<ProcessFlowItem>({
//     defaultValues: {
//         itemCode: "",
//         itemName: ""
//     }
// });


// const fetchItemList = async () => {
//     try {
//         const res = await itemService.getItemList(0,9999);
//         setItemRows(res?.result?.resultList ?? []);
//     } catch (err) {
//         console.error("품목 조회 실패:", err);
//         showSnackbar("품목 조회 실패", "error");
//     }
// };



// // 공정 흐름 선택시 공정+품목 가져오기
// const handleSelectFlow = async (flow: ProcessFlow) => {
//     const flowId = flow.processFlowId;
//
//     try {
//         // ✅ 병렬로 API 호출
//         const [processRes, itemRes] = await Promise.all([
//             processFlowService.getProcessFlowProcess(flowId),
//             processFlowService.getProcessFlowItem(flowId),
//         ]);
//
//         // ✅ 상태 업데이트
//         setFlowProcessRows(processRes.result?.resultList ?? []);
//         setFlowItemRows(itemRes.result?.resultList ?? []);
//
//     } catch (e) {
//         console.error("❌ 공정흐름 세부 조회 실패:", e);
//         showSnackbar("데이터 조회 실패", "error");
//     }
// };


// // 제품 신규 등록 Dialog 열기
// const handleOpenItemDialog = () => {
//     setItemDialogMode("create");
//     setOpenItemDialog(true);
// };

// // 제품 dialog 닫기
// const handleCloseItemDialog = () => {
//     setOpenItemDialog(false);
// };