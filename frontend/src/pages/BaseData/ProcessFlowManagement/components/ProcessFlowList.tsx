// components/ProcessFlowList.tsx
import React from "react";
import { DataGrid, GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import {Box, Button, IconButton, Paper, Stack} from "@mui/material";
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
} from "@mui/icons-material";
import { ProcessFlow } from "../../../../types/processFlow";

interface Props {
    rows: ProcessFlow[];
    paginationModel: GridPaginationModel;
    setPaginationModel: (model: GridPaginationModel) => void;
    onEdit: (row: ProcessFlow) => void;
    onDelete: (id: string) => void;
    onSelect: (row: ProcessFlow) => void;
}

export default function ProcessFlowList({
                                            rows,
                                            paginationModel,
                                            setPaginationModel,
                                            onEdit,
                                            onDelete,
                                   onSelect,
                                        }: Props) {

    const columns: GridColDef[] = [
        {
            field: "processFlowName",
            headerName: "공정흐름명",
            headerAlign: 'center',
            flex: 1
        },
        {
            field: "status",
            headerName: "상태",
            headerAlign: 'center',
            flex: 1
        },
        {
            field: "actions",
            headerName: "관리",
            sortable: false,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => (
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                    }}
                >
                    <Stack direction="row" spacing={1}>
                        <IconButton
                            size="small"
                            color="primary"
                            onClick={() => onEdit(params.row)}
                        >
                            <EditIcon />
                        </IconButton>
                        <IconButton
                            size="small"
                            color="error"
                            onClick={() => onDelete(params.row.processFlowId!)}
                        >
                            <DeleteIcon />
                        </IconButton>
                    </Stack>
                </Box>

            ),
        },
    ];

    return (
        <Paper sx={{ width: '100%' }}>
            <DataGrid
                rows={rows}
                columns={columns}
                getRowId={(row) => row.processFlowId || ''}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                pageSizeOptions={[5, 10, 25, 50]}
                // paginationMode="server"
                onRowClick={(params) => onSelect(params.row)}
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
        </Paper>

    );
}
