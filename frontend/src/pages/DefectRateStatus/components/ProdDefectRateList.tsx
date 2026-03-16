import React from 'react';
import {
    Box,
    Card, CardActions, CardContent, CircularProgress
} from '@mui/material';
import {DataGrid, GridColDef } from '@mui/x-data-grid';
import {ProductionDefectRateRow} from "../../../types/productionDefectRate";
import { formatNumberWithCommas } from '../../../utils/formatUtils';
import {decodeHtml} from "../../../utils/stringUtils";

interface Props {
    rows: ProductionDefectRateRow[];
    loading: boolean;
    rowCount: number;
    paginationModel: any;
    onPaginationChange: (model: any) => void;
}

const numberCol: Partial<GridColDef> = {
    type: "number",
    headerAlign: "center",
    align: "right",
    valueFormatter: (value) => formatNumberWithCommas(value),
};

const ProdDefectRateList = ({
    rows,
    loading,
    rowCount,
    paginationModel,
    onPaginationChange
}: Props) => {

    const columns: GridColDef[] = [
        {
            field: "orderNo",
            headerName: "수주번호",
            width: 140,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "customerName",
            headerName: "거래처",
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
            width: 100,
            headerAlign: "center",
            align: "center",
            valueFormatter: (value) => decodeHtml(value),
        },
        {
            field: "itemSpec",
            headerName: "품목규격",
            width: 100,
            headerAlign: "center",
            align: "center",
            valueFormatter: (value) => decodeHtml(value),
        },
        {
            field: "orderQty",
            headerName: "수주량",
            width: 80,
            ...numberCol
        },
        {
            field: "workDtDate",
            headerName: "작업지시일",
            width: 100,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "workName",
            headerName: "공정명",
            width: 100,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "prodItemCode",
            headerName: "공정품목코드",
            width: 100,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "prodItemName",
            headerName: "공정품목명",
            width: 100,
            headerAlign: "center",
            align: "center",
            valueFormatter: (value) => decodeHtml(value),
        },
        {
            field: "prodItemSpec",
            headerName: "공정품목규격",
            width: 100,
            headerAlign: "center",
            align: "center",
            valueFormatter: (value) => decodeHtml(value),
        },
        {
            field: "workQty",
            headerName: "작업지시량",
            width: 80,
            ...numberCol
        },
        {
            field: "prodQty",
            headerName: "생산량",
            width: 80,
            ...numberCol
        },
        {
            field: "goodQty",
            headerName: "합격량",
            width: 80,
            ...numberCol
        },
        {
            field: "badQty",
            headerName: "불량량",
            width: 80,
            ...numberCol
        },
        {
            field: "remainQty",
            headerName: "잔량",
            width: 80,
            ...numberCol
        },
        {
            field: "rate",
            headerName: "진척율(%)",
            width: 80,
            headerAlign: "center",
            align: "center",
            valueFormatter: (value) => value != null ? `${Number(value).toFixed(1)}%` : "0.0%",
        },
    ];

    return (
        <>
            <Card sx={{boxShadow: 2 }}>
                <CardContent sx={{ p: 0, position: 'relative' }}>
                    {loading && (
                        <Box
                            sx={{
                                position: 'absolute',
                                inset: 0,
                                zIndex: 10,
                                backgroundColor: 'rgba(255,255,255,0.6)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <CircularProgress size={48} />
                        </Box>
                    )}
                    <Box sx={{ height: 550 }}>
                        <DataGrid
                            rows={rows}
                            columns={columns}
                            loading={loading}
                            getRowId={(row) => row.tpr504Id}
                            pagination
                            paginationMode="server"
                            rowCount={rowCount}
                            pageSizeOptions={[10, 20, 50]}
                            paginationModel={paginationModel}
                            onPaginationModelChange={onPaginationChange}
                            rowHeight={30}
                            columnHeaderHeight={35}

                            sx={{
                                fontSize: 12.5,
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
                        ></DataGrid>
                    </Box>
                </CardContent>
                <CardActions sx={{ display: 'none' }} />
            </Card>
        </>
    );
}

export default ProdDefectRateList;