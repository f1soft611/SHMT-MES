// components/ProcessFlowList.tsx
import React from "react";
import { DataGrid, GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import {Box, Button, IconButton, Paper, Stack} from "@mui/material";
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Build as BuildIcon,
    Extension as ExtensionIcon
} from "@mui/icons-material";
import { ProcessFlow } from "../../../../types/processFlow";

interface Props {
    rows: ProcessFlow[];
    paginationModel: GridPaginationModel;
    setPaginationModel: (model: GridPaginationModel) => void;
    onEdit: (row: ProcessFlow) => void;
    onDelete: (id: string) => void;
    onDetailOpen: (row: ProcessFlow, tabIndex: number) => void;
}

export default function ProcessFlowList({
                                            rows,
                                            paginationModel,
                                            setPaginationModel,
                                            onEdit,
                                            onDelete,
                                   // onSelect,
                                            onDetailOpen
                                        }: Props) {

    const columns: GridColDef[] = [
        {
            field: "workplaceName",
            headerName: "작업장",
            headerAlign: 'center',
            align: 'center',
            flex: 1
        },
        {
            field: "processFlowCode",
            headerName: "공정흐름코드",
            headerAlign: 'center',
            align: 'center',
            flex: 1
        },
        {
            field: "processFlowName",
            headerName: "공정흐름명",
            headerAlign: 'center',
            align: 'center',
            flex: 1
        },
        {
            field: "actions",
            headerName: "관리",
            sortable: false,
            headerAlign: 'center',
            align: 'center',
            width: 200,
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
                            onClick={() => onDetailOpen(params.row, 0)}
                        >
                            <BuildIcon />
                        </IconButton>
                        <IconButton
                            size="small"
                            color="primary"
                            onClick={() => onDetailOpen(params.row, 1)}
                        >
                            <ExtensionIcon />
                        </IconButton>
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
                // onRowClick={(params) => onSelect(params.row)}
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
