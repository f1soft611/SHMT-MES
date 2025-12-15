import {useCallback, useEffect, useMemo, useState} from 'react';
import { GridPaginationModel, GridRowId } from '@mui/x-data-grid';
import itemService from '../../../../../services/itemService';
import processFlowService from '../../../../../services/processFlowService';
import {ProcessFlow, ProcessFlowItem} from "../../../../../types/processFlow";
import {Item} from "../../../../../types/item";

export function useDetailItemTab(
    selectedFlow: ProcessFlow | null,
    itemRows: Item[],
    flowItemRows: ProcessFlowItem[],
    setFlowItemRows: React.Dispatch<React.SetStateAction<ProcessFlowItem[]>>
) {

    const [itemPagination, setItemPagination] = useState<GridPaginationModel>({
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
        if (!inputValues.searchWrd.trim()) return itemRows;

        const keyword = inputValues.searchWrd.toLowerCase();

        return itemRows.filter(item => {
            if (inputValues.searchCnd === "0") {
                return item.itemCode?.toLowerCase().includes(keyword);
            }
            return item.itemName?.toLowerCase().includes(keyword);
        });
    }, [itemRows, inputValues]);

    const handleSearch = () => {
        setSearchParams(inputValues);
        setItemPagination(prev => ({ ...prev, page: 0 }));
    };


    /** 선택 관리 */
    const [leftSelected, setLeftSelected] = useState<GridRowId[]>([]);
    const [rightSelected, setRightSelected] = useState<GridRowId[]>([]);

    /** 오른쪽으로 추가 */
    const addItems  = () => {
        if (leftSelected.length === 0 || !selectedFlow) return;

        const existingCodes = new Set(flowItemRows.map(r => r.flowItemCode));

        const validItems = itemRows.filter(
            it => leftSelected.includes(it.itemCode) && !existingCodes.has(it.itemCode)
        );

        const newList: ProcessFlowItem[] = validItems.map(it => ({
            flowRowId: crypto.randomUUID(),
            flowItemId: null,

            flowItemCode: it.itemCode,
            flowItemCodeId: it.itemId ?? '',
            flowItemName: it.itemName,
            specification: it.specification ?? "",
            unit: it.unit ?? "",
            unitName: it.unitName ?? "",

            processFlowCode: selectedFlow.processFlowCode ?? "",
            processFlowId: selectedFlow.processFlowId ?? "",
        }));

        setFlowItemRows(prev => [...prev, ...newList]);
        setLeftSelected([]);
    }

    /** 오른쪽 목록 삭제 */
    const removeItems = () => {
        if (rightSelected.length === 0) return;

        setFlowItemRows(prev =>
            prev.filter(r => !rightSelected.includes(r.flowItemId ?? r.flowRowId))
        );

        setRightSelected([]);
    }

    /** 탭 초기화 */
    const clearItemTab = () => {
        setInputValues({ searchCnd: "0", searchWrd: "" });
        setLeftSelected([]);
        setRightSelected([]);
    };

    return {
        /** 검색 */
        inputValues,
        handleInputChange,
        filteredRows,
        handleSearch,

        /** 전체 품목 / 흐름 품목 */
        itemRows,
        flowItemRows,
        setFlowItemRows,

        /** 선택 */
        leftSelected,
        setLeftSelected,
        rightSelected,
        setRightSelected,

        /** 이동 처리 */
        addItems,
        removeItems,

        /** 초기화 */
        clearItemTab,
    };
}