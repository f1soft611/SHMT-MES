import { create } from 'zustand';
import { useRef, useEffect } from 'react';
import { useProductionOrder } from '../hooks/useProductionOrder';
import type { ProdPlanRow, ProdOrderRow, ProdPlanSearchParams } from '../../../types/productionOrder';
import type { Workplace } from '../../../types/workplace';
import type { EquipmentInfo } from '../../../types/equipment';
import type { GridPaginationModel } from '@mui/x-data-grid';

interface ProdOrderStoreState {
    planRows: ProdPlanRow[];
    planLoading: boolean;
    prodplanResultCnt: number;
    paginationModel: GridPaginationModel;
    search: ProdPlanSearchParams;
    selectedPlan: ProdPlanRow | null;
    localRows: ProdOrderRow[];
    orderResultCnt: number;
    orderLoading: boolean;
    open: boolean;
    workplaces: Workplace[];
    equipments: EquipmentInfo[];
    handleSearch: () => void;
    handleSearchChange: (name: string, value: string) => void;
    handlePaginationChange: (model: GridPaginationModel) => void;
    fetchProdPlan: () => void;
    handlePlanSelect: (plan: ProdPlanRow) => void;
    handleAddRow: (index: number) => void;
    handleRemoveRow: (index: number) => void;
    handleProcessRowUpdate: (newRow: ProdOrderRow) => ProdOrderRow;
    submit: () => void;
    deleteOrder: () => void;
    closeDialog: () => void;
}

export const useProdOrderStore = create<ProdOrderStoreState>()(() => ({
    planRows: [],
    planLoading: false,
    prodplanResultCnt: 0,
    paginationModel: { page: 0, pageSize: 10 },
    search: { dateFrom: '', dateTo: '' },
    selectedPlan: null,
    localRows: [],
    orderResultCnt: 0,
    orderLoading: false,
    open: false,
    workplaces: [],
    equipments: [],
    handleSearch: () => {},
    handleSearchChange: () => {},
    handlePaginationChange: () => {},
    fetchProdPlan: () => {},
    handlePlanSelect: () => {},
    handleAddRow: () => {},
    handleRemoveRow: () => {},
    handleProcessRowUpdate: (row) => row,
    submit: () => {},
    deleteOrder: () => {},
    closeDialog: () => {},
}));

export function useProdOrderStoreInit() {
    const hook = useProductionOrder();
    const hookRef = useRef(hook);
    hookRef.current = hook;

    const stableActionsRef = useRef({
        handleSearch: () => hookRef.current.handleSearch(),
        handleSearchChange: (name: string, value: string) => hookRef.current.handleSearchChange(name, value),
        handlePaginationChange: (model: GridPaginationModel) => hookRef.current.handlePaginationChange(model),
        fetchProdPlan: () => hookRef.current.fetchProdPlan(),
        handlePlanSelect: (plan: ProdPlanRow) => hookRef.current.handlePlanSelect(plan),
        handleAddRow: (index: number) => hookRef.current.handleAddRow(index),
        handleRemoveRow: (index: number) => hookRef.current.handleRemoveRow(index),
        handleProcessRowUpdate: (newRow: ProdOrderRow) => hookRef.current.handleProcessRowUpdate(newRow),
        submit: () => hookRef.current.submit(),
        deleteOrder: () => hookRef.current.deleteOrder(),
        closeDialog: () => hookRef.current.closeDialog(),
    });

    useEffect(() => {
        useProdOrderStore.setState(stableActionsRef.current);
    }, []);

    useEffect(() => {
        useProdOrderStore.setState({
            planRows: hook.planRows,
            planLoading: hook.planLoading,
            prodplanResultCnt: hook.prodplanResultCnt,
            paginationModel: hook.paginationModel,
            search: hook.search,
            selectedPlan: hook.selectedPlan,
            localRows: hook.localRows,
            orderResultCnt: hook.orderResultCnt,
            orderLoading: hook.orderLoading,
            open: hook.open,
            workplaces: hook.workplaces,
            equipments: hook.equipments,
        });
    }, [
        hook.planRows, hook.planLoading, hook.prodplanResultCnt,
        hook.paginationModel, hook.search, hook.selectedPlan,
        hook.localRows, hook.orderResultCnt, hook.orderLoading,
        hook.open, hook.workplaces, hook.equipments,
    ]);
}
