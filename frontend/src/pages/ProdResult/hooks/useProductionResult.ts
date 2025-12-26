import {useFetchWorkplaces} from "../../../hooks/useFetchWorkplaces";
import {useProdOrder} from "./useProdOrder";
import {useProdResultDialog} from "./useProdResultDialog";
import {useEffect, useState} from "react";


export function useProductionResult(rowData?: any) {

    // 검색필터 작업장 fetch 공통 훅
    const wpfetchHook = useFetchWorkplaces();

    // 생산지시
    const prodOrder = useProdOrder();

    // dialog 상태 훅
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
            dateFrom: rowData.PROD_DATE,
            dateTo: rowData.PROD_DATE,
            keyword: rowData.PROD_DATE // TODO: id값으로 변경
        }))
    }, [rowData]);

    return {
        search: prodOrder.search,
        handleSearchChange: prodOrder.handleSearchChange,
        handleSearch: prodOrder.handleSearch,

        rows: prodOrder.rows,
        rowCount: prodOrder.rowCount,
        loading: prodOrder.loading,

        pagination: prodOrder.pagination,
        setPagination: prodOrder.setPagination,
        handlePageChange: prodOrder.handlePageChange,
        handlePageSizeChange: prodOrder.handlePageSizeChange,

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