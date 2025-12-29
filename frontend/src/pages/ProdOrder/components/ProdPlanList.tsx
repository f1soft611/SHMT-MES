import React from "react";
import { useNavigate } from 'react-router-dom';
import {DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import {
    Box, Stack,
    Card, CardHeader, CardContent, CardActions, IconButton, Chip,
} from '@mui/material';
import {
    AssignmentAdd as AssignmentAddIcon,
    Input as InputIcon,
} from "@mui/icons-material";

interface Props {
    rows: any[];
    loading: boolean;
    onRowClick: (row: any) => void;
    paginationModel: GridPaginationModel;
    totalCount: number;
    onPaginationChange: (model: GridPaginationModel) => void;
}

function ProductionActionCell({ row }: { row: any }) {
    const navigate = useNavigate();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        navigate('/prod/results', {
            state: { rowData: row },
        });
    };

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
            }}
        >
            <Stack direction="row" spacing={1}>
                <IconButton size="small" color="primary" onClick={handleClick}>
                    <InputIcon />
                </IconButton>
            </Stack>
        </Box>
    );
};

const ProdPlanList = ({ rows, loading, onRowClick, paginationModel, totalCount, onPaginationChange }: Props) => {

    const columns: GridColDef[] = [
        {
            field: "ORDER_FLAG",
            headerName: "지시상태",
            width: 100,
            headerAlign: "center",
            align: "center",
            renderCell: (params) => {
                const isOrdered = params.value === 'ORDERED';
                return (
                    <Chip
                        label={params.value}
                        color={isOrdered ? 'primary' : 'default'}
                        size="small"
                    />
                );
            },
        },
        {
            field: "PRODPLAN_ID",
            headerName: "의뢰번호",
            width: 140,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "WORKCENTER_NAME",
            headerName: "작업장",
            width: 120,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "EQUIPMENT_NAME",
            headerName: "설비명",
            width: 100,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "PRODPLAN_DATE",
            headerName: "생산계획일",
            width: 100,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "ITEM_CODE",
            headerName: "품목코드",
            width: 80,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "ITEM_NAME",
            headerName: "품목명",
            width: 250,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "PROD_QTY",
            headerName: "계획량",
            width: 70,
            headerAlign: "center",
            align: "right",
            renderCell: (params) => (params.value ?? 0).toLocaleString(),
        },
        {
            field: "LOT_NO",
            headerName: "LOT_NO",
            width: 100,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "BIGO",
            headerName: "비고",
            width: 200,
            headerAlign: "center",
            align: "left",
        },
        {
            field: "actionOrder",
            headerName: "생산지시",
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
                            onClick={(e) => {
                                e.stopPropagation();
                                onRowClick(params.row);
                            }}
                        >
                            <AssignmentAddIcon />
                        </IconButton>

                    </Stack>
                </Box>
            )
        },
        {
            field: "actionResult",
            headerName: "생산실적",
            sortable: false,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => <ProductionActionCell row={params.row} />
        },
    ];

    return(
        <Card sx={{boxShadow: 2 }}>
            {/* 타이틀 */}
            <CardHeader sx={{ p: 1, }}
                        title="생산계획 목록"
                        titleTypographyProps={{
                            fontSize: 16,
                        }}
            />
            <CardContent sx={{ p: 0 }}>
                <Box sx={{ height: 500 }}>
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        loading={loading}
                        disableRowSelectionOnClick
                        getRowId={(row) => row.PRODPLAN_ID}
                        pagination
                        paginationMode="server"
                        rowCount={totalCount}
                        pageSizeOptions={[10, 20, 50]}
                        paginationModel={paginationModel}
                        onPaginationModelChange={onPaginationChange}
                        rowHeight={35}
                        columnHeaderHeight={40}
                        sx={{
                            fontSize: 14,
                            "& .MuiDataGrid-cell": {
                                padding: "0 2px",     // 셀 패딩 축소
                            },
                            '& .MuiDataGrid-cell:focus': {
                                outline: 'none',
                            },
                            '& .MuiDataGrid-row:hover': {
                                backgroundColor: 'action.hover',
                            },
                        }}
                    />
                </Box>
            </CardContent>
            <CardActions sx={{ display: 'none' }} />
        </Card>
    )
}

export default ProdPlanList;