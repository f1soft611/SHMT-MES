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
import {ProdPlanRow} from "../../../types/productionOrder";

interface Props {
    rows: ProdPlanRow[];
    loading: boolean;
    onRowClick: (row: ProdPlanRow) => void;
    paginationModel: GridPaginationModel;
    totalCount: number;
    onPaginationChange: (model: GridPaginationModel) => void;
}

function ProductionActionCell({
                                  row,
                                  icon,
                                  color = "primary",
                                  onClick,
                              }: {
    row: ProdPlanRow;
    icon: React.ReactNode;
    color?: "primary" | "inherit" | "secondary" | "default";
    onClick: (row: ProdPlanRow) => void;
}) {
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
                <IconButton
                    size="small"
                    color={color}
                    onClick={(e) => {
                        e.stopPropagation();
                        onClick(row);
                    }}
                >
                    {icon}
                </IconButton>
            </Stack>
        </Box>
    );
}

const ProdPlanList = ({ rows, loading, onRowClick, paginationModel, totalCount, onPaginationChange }: Props) => {

    const navigate = useNavigate();

    const columns: GridColDef[] = [
        {
            field: "orderFlag",
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
            field: "orderGubun",
            headerName: "의뢰구분",
            width: 100,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "prodplanId",
            headerName: "지시번호",
            width: 140,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "workcenterName",
            headerName: "작업장",
            width: 100,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "equipmentName",
            headerName: "설비명",
            width: 100,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "itemCode",
            headerName: "품목코드",
            width: 100,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "itemName",
            headerName: "품목명",
            width: 250,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "prodplanDate",
            headerName: "생산계획일",
            width: 100,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "prodQty",
            headerName: "계획량",
            width: 70,
            headerAlign: "center",
            align: "right",
            renderCell: (params) => (params.value ?? 0).toLocaleString(),
        },
        {
            field: "lotNo",
            headerName: "LOT_NO",
            width: 100,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "bigo",
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
                <ProductionActionCell
                    row={params.row as ProdPlanRow}
                    icon={<AssignmentAddIcon />}
                    onClick={onRowClick}
                />
            ),
        },
        {
            field: "actionResult",
            headerName: "생산실적",
            sortable: false,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => (
                <ProductionActionCell
                    row={params.row as ProdPlanRow}
                    icon={<InputIcon />}
                    onClick={(row) =>
                        navigate("/prod/results", {
                            state: { rowData: row },
                        })
                    }
                />
            ),
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
                <Box sx={{ height: 550 }}>
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        loading={loading}
                        disableRowSelectionOnClick
                        getRowId={(row) => row.prodplanDate + row.prodplanSeq + row.prodworkSeq}
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