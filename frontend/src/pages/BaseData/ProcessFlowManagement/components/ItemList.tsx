// components/ItemList.tsx
import React from "react";
import { DataGrid, GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import {Box, Button, Paper, Stack} from "@mui/material";
import {
    Add as AddIcon,
    Save as SaveIcon,
    // Edit as EditIcon,
    Delete as DeleteIcon,
    // People as PeopleIcon,
    Search as SearchIcon,
    // Build as BuildIcon,
} from '@mui/icons-material';
import { Item } from "../../../../types/item";

interface Props {
    rows: Item[];
    // paginationModel: GridPaginationModel;
    // setPaginationModel: (model: GridPaginationModel) => void;
    // onEdit: (row: Item) => void;
    // onDelete: (id: string) => void;
}

export default function ItemList({
                                        rows,
                                        // paginationModel,
                                        // setPaginationModel,
                                        // onEdit,
                                        // onDelete,
                                    }: Props) {

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
                        // onClick={handleSearch}
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
