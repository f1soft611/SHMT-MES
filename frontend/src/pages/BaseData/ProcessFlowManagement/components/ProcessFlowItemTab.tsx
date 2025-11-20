import {DataGrid, GridColDef, GridPaginationModel, GridRowId} from "@mui/x-data-grid";
import {Button, Paper, Stack, Box, FormControl, InputLabel, Select, MenuItem, TextField, Grid} from "@mui/material";
import {
    Search as SearchIcon,
} from '@mui/icons-material';
import React, {useState} from "react";

import { useProcessFlowDetailContext } from "../hooks/useProcessFlowDetailContext";
import {Item} from "../../../../types/item";
import {ProcessFlowItem} from "../../../../types/processFlow";
import {useProcessFlowDetail} from "../hooks/useProcessFlowDetail"


export default function ProcessFlowItemTab() {

    const {
        processFlow,
        itemRows,        // 전체 제품 목록
        flowItemRows,    // 흐름에 속한 제품 목록
        setFlowItemRows, // 흐름 제품 setter
    } = useProcessFlowDetailContext();

    const {
        inputValues,
        handleInputChange,
        handleSearch,
        filteredRows: filteredItemRows,
    } = useProcessFlowDetail(itemRows, {
        fields: {
            "0": (row) => row.itemCode,
            "1": (row) => row.itemName,
        }
    });

    const [leftSelected, setLeftSelected] = useState<GridRowId[]>([]);
    const [rightSelected, setRightSelected] = useState<GridRowId[]>([]);


    const columns: GridColDef[] = [
        { field: 'itemCode', headerName: '품목 코드', flex: 1, headerAlign: 'center' },
        { field: 'itemName', headerName: '품목명', flex: 1.2, headerAlign: 'center' },
        { field: 'specification', headerName: '규격', flex: 1, headerAlign: 'center', align: 'center' },
        { field: 'unit', headerName: '단위', flex: 1, headerAlign: 'center', align: 'center' },
    ];

    const rightColumns: GridColDef[] = [
        { field: 'flowItemCode', headerName: '품목 코드', flex: 1, headerAlign: 'center' },
        { field: 'flowItemName', headerName: '품목명', flex: 1.2, headerAlign: 'center' },
        { field: 'specification', headerName: '규격', flex: 1, headerAlign: 'center', align: 'center' },
        { field: 'unit', headerName: '단위', flex: 1, headerAlign: 'center', align: 'center' },
    ];



    const handleMoveRight = () => {
        if (leftSelected.length === 0 || !processFlow) return;

        // 이미 추가된 itemCode 목록
        const existingCodes = new Set(flowItemRows.map(row => row.flowItemCode));

        // 선택된 아이템 중 기존에 없는 것만 추림
        const filteredItems = itemRows.filter(
            it => leftSelected.includes(it.itemCode) && !existingCodes.has(it.itemCode)
        );

        // 신규 추가 목록 생성
        const newRows: ProcessFlowItem[] = filteredItems.map(i => ({
            flowRowId: crypto.randomUUID(),
            flowItemId: null,
            flowItemCode: i.itemCode,
            flowItemName: i.itemName,
            specification: i.specification ?? "",
            unit: i.unit ?? "",
            processFlowCode: processFlow.processFlowCode ?? "",
            processFlowId: processFlow.processFlowId ?? "",
        }));

        setFlowItemRows(prev => [...prev, ...newRows]);
        setLeftSelected([]);
    }

    const handleRemoveRight = () => {
        if (rightSelected.length === 0) return;
        setFlowItemRows(prev =>
            prev.filter(i => !rightSelected.includes(i.flowItemId ?? i.flowRowId))
        );
    }



    return(
        <>
            {/* 검색 영역 */}
            <Box sx={{mb: 2 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                    <FormControl size="small" sx={{ minWidth: 200 }}>
                        <InputLabel>검색 조건</InputLabel>
                        <Select
                            value={inputValues.searchCnd}
                            label="검색 조건"
                            onChange={(e) => handleInputChange('searchCnd', e.target.value)}
                        >
                            <MenuItem value="0">품목 코드</MenuItem>
                            <MenuItem value="1">품목명</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        size="small"
                        sx={{ flex: 1 }}
                        placeholder="검색어를 입력하세요"
                        value={inputValues.searchWrd}
                        onChange={(e)=>handleInputChange("searchWrd", e.target.value)}
                        onKeyDown={(e)=>e.key==="Enter" && handleSearch()}
                    />
                    <Button
                        variant="contained"
                        startIcon={<SearchIcon />}
                        onClick={handleSearch}
                        sx={{ minWidth: 150 }}
                    >
                        검색
                    </Button>
                </Stack>
            </Box>

            <Grid container spacing={1} direction="row">
                <Grid size={{ xs:5.5  }}>
                    <DataGrid
                        rows={filteredItemRows}
                        columns={columns}
                        getRowId={(row:Item) => row.itemCode}
                        checkboxSelection
                        disableRowSelectionExcludeModel
                        // ★ selectionModel은 include 방식으로만 설정 가능
                        rowSelectionModel={{
                            type: 'include',
                            ids: new Set(leftSelected),
                        }}
                        onRowSelectionModelChange={(model) => {
                            setLeftSelected(Array.from(model.ids));
                        }}
                        // onRowSelectionModelChange={(model) => {
                        //     const anyModel = model as { ids: Set<GridRowId> };
                        //     setLeftSelected(Array.from(anyModel.ids ?? []));
                        // }}
                        autoHeight={false}
                        sx={{
                            height: 450,
                        }}
                    />
                </Grid>
                <Grid size={{ xs:1  }}>
                    <Box
                        sx={{
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: 1, // 버튼 간격
                        }}
                    >
                        <Button
                            sx={{ my: 0.5 }}
                            variant="outlined"
                            size="small"
                            onClick={handleMoveRight}
                            disabled={leftSelected.length === 0}
                            aria-label="move selected right"
                        >
                            &gt;
                        </Button>
                        <Button
                            sx={{ my: 0.5 }}
                            variant="outlined"
                            size="small"
                            onClick={handleRemoveRight}
                            disabled={rightSelected.length === 0}
                            aria-label="move selected left"
                        >
                            &lt;
                        </Button>
                    </Box>
                </Grid>
                <Grid size={{ xs:5.5  }}>
                    <DataGrid
                        rows={flowItemRows}
                        columns={rightColumns}
                        getRowId={(row) => row.flowItemId ?? row.flowRowId}
                        checkboxSelection
                        disableRowSelectionOnClick
                        disableRowSelectionExcludeModel
                        onRowSelectionModelChange={(model) => {
                            const anyModel = model as { ids: Set<GridRowId> };
                            setRightSelected(Array.from(anyModel.ids ?? []))
                        }}
                        autoHeight={false}
                        sx={{
                            height: 450,
                        }}
                    />
                </Grid>
            </Grid>
        </>
    )
}