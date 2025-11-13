import { DataGrid, GridColDef, GridPaginationModel } from "@mui/x-data-grid";
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
import React from "react";
import {ItemList} from "./index";

interface Props {
    rows: any[];
    // onEdit: (row: Process) => void;
    // onDelete: (id: string) => void;
}

export default function ProcessFlowItemTab( {rows}:Props) {
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
                    <ItemList />
                </Grid>
                <Grid size={{ xs:1  }}></Grid>
                <Grid size={{ xs:5.5  }}>
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        getRowId={(row) => row.factoryCode || ''}
                        disableRowSelectionOnClick
                        autoHeight
                        sx={{
                            border: 'none',
                            '& .MuiDataGrid-cell:focus': {
                                outline: 'none',
                            },
                            '& .MuiDataGrid-row:hover': {
                                backgroundColor: 'action.hover',
                            },
                        }}
                    />
                </Grid>
            </Grid>
        </>
    )
}