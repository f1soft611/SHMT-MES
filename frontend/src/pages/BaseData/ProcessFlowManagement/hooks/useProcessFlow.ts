import {useProcessFlowList} from "./main/useProcessFlowList";
import {useProcessFlowMainDialog} from "./main/useProcessFlowMainDialog";
import {useProcessFlowMainActions} from "./main/useProcessFlowMainActions";
import {useProcessFlowDetailDialog} from "./detail/useProcessFlowDetailDialog";
import {useProcessFlowDetailActions} from "./detail/useProcessFlowDetailActions";

export function useProcessFlow() {

    const list = useProcessFlowList();
    const mainDialog = useProcessFlowMainDialog();
    const mainActions = useProcessFlowMainActions(
        list.fetchProcessFlows,
        mainDialog.closeMainDialog
    );

    const detailDialog = useProcessFlowDetailDialog();
    const detailActions = useProcessFlowDetailActions(
        detailDialog.selectedFlow
    );


    return {
        /** 목록 */
        rows: list.rows,
        rowCount: list.rowCount,
        loading: list.loading,
        paginationModel: list.paginationModel,
        setPaginationModel: list.setPaginationModel,
        searchParams: list.searchParams,
        inputValues: list.inputValues,
        handleInputChange: list.handleInputChange,
        handleSearch: list.handleSearch,
        fetchProcessFlows: list.fetchProcessFlows,

        /** 메인 Dialog */
        openDialog: mainDialog.open,
        dialogMode: mainDialog.dialogMode,
        selectedFlow: mainDialog.selectedFlow,
        workplaces: mainDialog.workplaces,
        errors: mainDialog.errors,
        methods: mainDialog.methods,
        handleOpenCreateDialog: mainDialog.handleOpenCreateDialog,
        handleOpenEditDialog: mainDialog.handleOpenEditDialog,
        closeMainDialog: mainDialog.closeMainDialog,

        /** 저장/삭제 */
        buildSubmitHandler: mainDialog.buildSubmitHandler,
        handleSave: mainActions.handleSave,
        handleDelete: mainActions.handleDelete,

        /** 상세 Dialog */
        openDetailDialog: detailDialog.openDetailDialog,
        detailTab: detailDialog.detailTab,
        setDetailTab: detailDialog.setDetailTab,
        selectedFlowDetail: detailDialog.selectedFlow,
        handleOpenDetailDialog: detailDialog.handleOpenDetailDialog,
        handleCloseDetailDialog: detailDialog.handleCloseDetailDialog,

        /** 상세 저장 액션 */
        handleDetailSave: detailActions.handleDetailSave,
        itemLoading: detailActions.loading,
    };
}

