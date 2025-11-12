// components/ProcessList.tsx
import React from "react";
import { DataGrid, GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import { Button, Paper, Stack, Box } from "@mui/material";
import {
    Add as AddIcon,
    Save as SaveIcon,
    // Edit as EditIcon,
    Delete as DeleteIcon,
    // People as PeopleIcon,
    Search as SearchIcon,
    // Build as BuildIcon,
} from '@mui/icons-material';
import { Process } from "../../../../types/process";

interface Props {
    rows: Process[];
    // onEdit: (row: Process) => void;
    // onDelete: (id: string) => void;
}

export default function ProcessList({
                                            rows,
                                            // paginationModel,
                                            // setPaginationModel,
                                            // onEdit,
                                            // onDelete,
                                        }: Props) {

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
        {
            field: "actions",
            headerName: "삭제",
            sortable: false,
            headerAlign: 'center',
        },
    ];

    return (
        <>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    mb: 1,         // 리스트와 간격
                }}
            >
                <Stack direction="row" spacing={1} alignItems="center">
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                    >
                        추가
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<SaveIcon />}
                        // onClick={handleSearch}
                    >
                        저장
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<DeleteIcon />}
                        // onClick={handleSearch}
                    >
                        삭제
                    </Button>
                </Stack>
            </Box>
            <DataGrid
                rows={rows}
                columns={columns}
                // getRowId={(row) => row.processFlowId || ''}
                disableRowSelectionOnClick
                hideFooter
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
        </>

    );
}
