import {DataGrid, GridColDef, GridRowId, GridRowSelectionModel} from "@mui/x-data-grid";
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
import React, {useState} from "react";
import { ProcessList} from "./index";

interface Props {
    // rows: any[];
    // onEdit: (row: Process) => void;
    // onDelete: (id: string) => void;
}

export default function ProcessFlowProcessTab() {

    const [leftSelected, setLeftSelected] = useState<GridRowId[]>([]);


    const columns: GridColDef[] = [
        {
            field: 'processCode',
            headerName: '공정 코드',
            flex: 1,
            headerAlign: 'center',
        },
        {
            field: 'processName',
            headerName: '공정 명',
            flex: 1,
            headerAlign: 'center',
        },
        {
            field: 'bigo',
            headerName: '비고',
            flex: 1,
            headerAlign: 'center',
        },
    ];

    const handleCheckedToRight = () => {
        console.log("왼쪽에서 선택된 ID 목록:", leftSelected);
    };


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
                    <ProcessList onSelectionChange={(ids) => setLeftSelected(ids)} />
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
                            onClick={handleCheckedToRight}
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
                    {/*<Grid container direction="column" sx={{ justifyContent: 'center', alignItems: 'center' }}>*/}
                    {/*    */}
                    {/*</Grid>*/}
                </Grid>
                <Grid size={{ xs:5.5  }}>
                    <DataGrid
                        // rows={rows}
                        columns={columns}
                        getRowId={(row) => row.processId || ''}
                        checkboxSelection
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