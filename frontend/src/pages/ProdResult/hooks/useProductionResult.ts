import {useFetchWorkplaces} from "../../../hooks/useFetchWorkplaces";
import {useProdOrder} from "./useProdOrder";
import {useProdResultDialog} from "./useProdResultDialog";
import {useEffect, useState} from "react";


export function useProductionResult(rowData?: any) {

    const wpfetchHook = useFetchWorkplaces();
    const prodOrder = useProdOrder();
    const dialog = useProdResultDialog();

    // 선택된 생산지시
    const [selectedOrder, setSelectedOrder] = useState<any>([]);

    // 생산지시 row 선택했을때
    const handleResultSelect = async (row: any) => {
        setSelectedOrder(row);
        dialog.openDialog();
    }


    // 생산지시에서 넘어오는경우 rowData !== null
    useEffect(() => {
        if (!rowData) return;
        prodOrder.setSearch(prevState => ({
            workplace: rowData.WORKCENTER_CODE,
            equipment: rowData.EQUIP_SYS_CD,
            dateFrom: rowData.PRODPLAN_DATE,
            dateTo: rowData.PRODPLAN_DATE
        }))
    }, [rowData]);

    return {
        search: prodOrder.search,
        handleSearchChange: prodOrder.handleSearchChange,
        handleSearch: prodOrder.handleSearch,

        rows: prodOrder.rows,
        rowCount: prodOrder.rowCount,
        loading: prodOrder.loading,

        paginationModel: prodOrder.paginationModel,
        setPaginationModel: prodOrder.setPaginationModel,

        workplaces: wpfetchHook.workplaces,
        refetchWorkplaces: wpfetchHook.refetchWorkplaces,

        handleResultSelect,

        order: selectedOrder,
        open: dialog.open,
        openDialog: dialog.openDialog,
        closeDialog: dialog.closeDialog,
        submit: dialog.submit,
    };
}