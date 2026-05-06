import { create } from 'zustand';
import { useRef, useEffect } from 'react';
import { useProdOrder } from '../hooks/useProdOrder';
import { useFetchWorkplaces } from '../../../hooks/useFetchWorkplaces';
import type { ProdResultOrderRow, ProductionResultSearchForm } from '../../../types/productionResult';
import type { ProdPlanRow } from '../../../types/productionOrder';
import type { Workplace } from '../../../types/workplace';
import type { GridFilterModel, GridPaginationModel } from '@mui/x-data-grid';

interface ProdResultStoreState {
    rows: ProdResultOrderRow[];
    loading: boolean;
    rowCount: number;
    pagination: GridPaginationModel;
    search: ProductionResultSearchForm;
    workplaces: Workplace[];
    selectedRow: ProdResultOrderRow | null;

    handleSearch: () => void;
    handleSearchChange: (name: string, value: string) => void;
    onPaginationChange: (model: GridPaginationModel) => void;
    onFilterChange: (model: GridFilterModel) => void;
    handleRowClick: (row: ProdResultOrderRow) => void;
    initFromNavigation: (rowData: ProdPlanRow | null) => void;
}

const today = new Date().toISOString().slice(0, 10);

export const useProdResultStore = create<ProdResultStoreState>()(() => ({
    // 화면 진입 시점에는 빈 상태로 시작하고, 실제 데이터는 초기화 훅에서 동기화한다.
    rows: [],
    loading: false,
    rowCount: 0,
    pagination: { page: 0, pageSize: 20 },
    search: { dateFrom: today, dateTo: today, workplace: '', equipment: '', keyword: '' },
    workplaces: [],
    selectedRow: null,

    handleSearch: () => {},
    handleSearchChange: () => {},
    onPaginationChange: () => {},
    onFilterChange: () => {},
    handleRowClick: () => {},
    initFromNavigation: () => {},
}));

export function useProdResultStoreInit() {
    const prodOrder = useProdOrder();
    const { workplaces } = useFetchWorkplaces();

    // Zustand 액션은 한 번만 주입하고, 내부에서는 항상 최신 훅 인스턴스를 참조하도록 유지한다.
    const hookRef = useRef({ prodOrder });
    hookRef.current = { prodOrder };

    const stableActionsRef = useRef({
        handleSearch: () => hookRef.current.prodOrder.handleSearch(),
        handleSearchChange: (name: string, value: string) =>
            hookRef.current.prodOrder.handleSearchChange(name, value),
        onPaginationChange: (model: GridPaginationModel) =>
            hookRef.current.prodOrder.onPaginationChange(model),
        onFilterChange: (model: GridFilterModel) =>
            hookRef.current.prodOrder.onFilterChange(model),
        handleRowClick: (row: ProdResultOrderRow) => {
            useProdResultStore.setState({ selectedRow: row });
        },
        initFromNavigation: (rowData: ProdPlanRow | null) => {
            if (!rowData?.prodDate) return;

            const formatDate = (v: string) =>
                `${v.slice(0, 4)}-${v.slice(4, 6)}-${v.slice(6, 8)}`;

            // 생산계획 화면에서 전달된 값을 실적 조회 조건으로 그대로 매핑한다.
            const nextSearch = {
                dateFrom: formatDate(rowData.prodplanDate),
                dateTo: formatDate(rowData.prodplanDate),
                workplace: rowData.workcenterCode,
                equipment: '',
                keyword: rowData.prodplanDetailId,
            };

            hookRef.current.prodOrder.setSearch((prev) => ({ ...prev, ...nextSearch }));
            hookRef.current.prodOrder.setSearchParams({
                ...nextSearch,
                dateFrom: rowData.prodplanDate,
                dateTo: rowData.prodplanDate,
            });

            // 새 조건으로 재조회할 때는 첫 페이지부터 다시 보도록 page를 0으로 되돌린다.
            const model = { ...hookRef.current.prodOrder.paginationModel, page: 0 };
            hookRef.current.prodOrder.onPaginationChange(model);
        },
    });

    useEffect(() => {
        useProdResultStore.setState(stableActionsRef.current);
    }, []);

    useEffect(() => {
        // 조회 훅의 반응형 값을 store 스냅샷으로 동기화해 다른 컴포넌트도 같은 상태를 구독하게 한다.
        useProdResultStore.setState({
            rows: prodOrder.rows,
            loading: prodOrder.loading,
            rowCount: prodOrder.rowCount,
            pagination: prodOrder.paginationModel,
            search: prodOrder.search,
        });
    }, [
        prodOrder.rows,
        prodOrder.loading,
        prodOrder.rowCount,
        prodOrder.paginationModel,
        prodOrder.search,
    ]);

    useEffect(() => {
        // 작업장 목록은 공통 조회 훅에서 받아 store에 보관한다.
        useProdResultStore.setState({ workplaces });
    }, [workplaces]);
}
