import {useFetchWorkplaces} from "../../../hooks/useFetchWorkplaces";
import {useProdOrder} from "./useProdOrder";


export function useProductionResult() {

    const wpfetchHook = useFetchWorkplaces();
    const prodOrder = useProdOrder()




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
        refetchWorkplaces: wpfetchHook.refetchWorkplaces
    };
}