import {DataGrid, GridColDef, GridPaginationModel, GridRowId} from "@mui/x-data-grid";
import {Button, Paper, Stack, Box, FormControl, InputLabel, Select, MenuItem, TextField, Grid} from "@mui/material";
import {
    Add as AddIcon,
    Save as SaveIcon,
    // Edit as EditIcon,
    Delete as DeleteIcon,
    // People as PeopleIcon,
    Search as SearchIcon,
    // Build as BuildIcon,
} from '@mui/icons-material';
import React, {useEffect, useState} from "react";
import {ItemList} from "./index";

interface Props {
    // itemRows: any[];       // 전체 품목
    // flowItemRows: any[];   // 공정흐름에 등록된 품목
}

export default function ProcessFlowItemTab() {

    // 좌/우 데이터 상태
    const [leftRows, setLeftRows] = useState<any[]>([]);
    const [rightRows, setRightRows] = useState<any[]>([]);

    // 선택된 row id 저장
    const [leftSelected, setLeftSelected] = useState<GridRowId[]>([]);
    const [rightSelected, setRightSelected] = useState<GridRowId[]>([]);

    const getRowId = (r: any) => r.itemCode;

    // ▶ 좌 → 우 이동
    const moveRight = () => {
        const move = leftRows.filter((r) => leftSelected.includes(getRowId(r)));
        const remain = leftRows.filter((r) => !leftSelected.includes(getRowId(r)));

        setLeftRows(remain);
        setRightRows([...rightRows, ...move]);
        setLeftSelected([]);
    };

    // ◀ 우 → 좌 이동
    const moveLeft = () => {
        const move = rightRows.filter((r) => rightSelected.includes(getRowId(r)));
        const remain = rightRows.filter((r) => !rightSelected.includes(getRowId(r)));

        setRightRows(remain);
        setLeftRows([...leftRows, ...move]);
        setRightSelected([]);
    };

    const columns: GridColDef[] = [
        {
            field: 'itemCode',
            headerName: '품목 코드',
            flex: 1,
            headerAlign: 'center',
        },
        {
            field: 'itmeName',
            headerName: '품목명',
            flex: 1.2,
            headerAlign: 'center',
        },
        {
            field: 'itemSpec',
            headerName: '규격',
            align: 'center',
            flex: 1,
            headerAlign: 'center',
        },
        {
            field: 'itemUnit',
            headerName: '단위',
            align: 'center',
            flex: 1,
            headerAlign: 'center',
        },
    ];

    // useEffect(() => {
    //     setLeftRows(itemRows ?? []);        // 전체 품목
    //     setRightRows(flowItemRows ?? []);   // 등록된 품목
    // }, [itemRows, flowItemRows, open]);

    return(
        <>
            {/* 검색 영역 */}
            <Box sx={{mb: 2 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>검색 조건</InputLabel>
                        <Select
                            // value={inputValues.searchCnd}
                            label="검색 조건"
                            // onChange={(e) => handleInputChange('searchCnd', e.target.value)}
                        >
                            <MenuItem value="0">작업장 코드</MenuItem>
                            <MenuItem value="1">작업장명</MenuItem>
                            <MenuItem value="2">위치</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        size="small"
                        // value={inputValues.searchWrd}
                        // onChange={(e) => handleInputChange('searchWrd', e.target.value)}
                        // onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        sx={{ flex: 1 }}
                        placeholder="검색어를 입력하세요"
                    />
                    <Button
                        variant="contained"
                        startIcon={<SearchIcon />}
                        // onClick={handleSearch}
                    >
                        검색
                    </Button>
                </Stack>
            </Box>

            <Grid container spacing={1} direction="row">
                <Grid size={{ xs:5.5  }}>
                    <DataGrid
                        rows={leftRows}
                        columns={columns}
                        getRowId={getRowId}
                        checkboxSelection
                        autoHeight
                        onRowSelectionModelChange={(v) => {
                            const arr = Array.isArray(v) ? v : [];
                            setLeftSelected(arr);
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
                            // onClick={handleCheckedToRight}
                            // disabled={leftChecked.length === 0}
                            aria-label="move selected right"
                        >
                            &gt;
                        </Button>
                        <Button
                            sx={{ my: 0.5 }}
                            variant="outlined"
                            size="small"
                            // onClick={handleCheckedLeft}
                            // disabled={rightChecked.length === 0}
                            aria-label="move selected left"
                        >
                            &lt;
                        </Button>
                    </Box>
                </Grid>
                <Grid size={{ xs:5.5  }}>
                    <DataGrid
                        rows={rightRows}
                        columns={columns}
                        getRowId={getRowId}
                        checkboxSelection
                        autoHeight
                        onRowSelectionModelChange={(v) => {
                            const arr = Array.isArray(v) ? v : [];
                            setRightSelected(arr);
                        }}
                    />
                </Grid>
            </Grid>
        </>
    )
}