import React, {useState} from "react";
import {DataGrid, GridColDef, GridPaginationModel, GridToolbarContainer} from "@mui/x-data-grid";
import {
    Card, CardContent, CardActions, CircularProgress, Box,
} from "@mui/material";
import {ProdResultOrderRow} from "../../../types/productionResult";
import ConfirmDialog from "../../../components/common/Feedback/ConfirmDialog";
import {formatNumberWithCommas} from "../../../utils/formatUtils";

interface Props {
    rows: ProdResultOrderRow[];
    loading: boolean;
    totalCount: number;
    paginationModel: GridPaginationModel;
    onPaginationChange: (model: GridPaginationModel) => void;
    onFilterChange: (model: any) => void;
    onRowClick: (row: ProdResultOrderRow) => void;
}

const numberCol: Partial<GridColDef> = {
    type: "number",
    headerAlign: "center",
    align: "right",
    valueFormatter: (value) => formatNumberWithCommas(value),
};


export default function ProdResultOrderList({rows, loading, totalCount, paginationModel, onPaginationChange, onFilterChange, onRowClick}: Props) {

    const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);


    const columns: GridColDef[] = [
        { field: 'orderNo', headerName: '수주번호', width: 120},
        { field: 'customerName', headerName: '거래처', width: 120 },
        { field: 'itemCode', headerName: '제품번호', width: 100 },
        { field: 'itemName', headerName: '제품명', width: 150 },
        { field: 'lotNo', headerName: '제품 LotNo', width: 150 },
        { field: 'workName', headerName: '공정명', width: 120 },
        { field: 'equipSysCd', headerName: '설비코드', width: 100 },
        { field: 'equipSysCdNm', headerName: '설비명', width: 120 },
        { field: 'prodCode', headerName: '생산품목번호', width: 100 },
        { field: 'prodName', headerName: '생산품목명', width: 150 },
        { field: 'prodSpec', headerName: '생산품목규격', width: 150 },
        {field: 'workdtDate', headerName: '작업시작일', width: 120,},
        {
            field: 'orderQty',
            headerName: '작업지시량',
            width: 80,
            ...numberCol,
        },
        {
            field: 'prodQty',
            headerName: '생산수량',
            width: 80,
            ...numberCol,
        },
        {
            field: 'goodQty',
            headerName: '양품수량',
            width: 80,
            ...numberCol,
        },
        {
            field: 'badQty',
            headerName: '불량수량',
            width: 80,
            ...numberCol,
        },
        { field: 'bigo', headerName: '비고', width: 200 },
    ].map(col => ({
        headerAlign: 'center',
        align:'center',
        ...col,
    }));

    const Toolbar = () => (
        <GridToolbarContainer
            sx={{
                px: 1.5,
                py: 0.75,
                borderBottom: "1px solid #e0e0e0",
                fontSize: 16,
                fontWeight: 600,
            }}
        >
            <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
                <Box sx={{ fontSize: 16, fontWeight: 600 }}>
                    생산지시 목록
                </Box>
            </Box>


        </GridToolbarContainer>
    );

    return(
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
                    <Box sx={{ height: 300 }}>
                        <DataGrid
                            rows={rows}
                            columns={columns}
                            loading={loading}
                            onRowClick={(params) => onRowClick(params.row)}
                            getRowId={(row:ProdResultOrderRow) => row.tpr504Id}
                            pagination
                            paginationMode="server"
                            rowCount={totalCount}
                            pageSizeOptions={[10, 20, 50]}
                            paginationModel={paginationModel}
                            onPaginationModelChange={onPaginationChange}
                            filterMode="server"
                            onFilterModelChange={onFilterChange}
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
                            showToolbar
                            slots={{ toolbar: Toolbar }}
                            columnVisibilityModel={{
                                equipSysCd: false,
                            }}
                        />
                    </Box>
                </CardContent>
                <CardActions sx={{ display: 'none' }} />
            </Card>

            <ConfirmDialog
                open={cancelConfirmOpen}
                title="생산실적 삭제"
                message={
                    <>
                        선택한 생산실적 <b>삭제</b>하시겠습니까?
                    </>
                }
                confirmText="일괄 취소"
                cancelText="닫기"
                loading={loading}
                onClose={() => setCancelConfirmOpen(false)}
                onConfirm={async () => {
                    setCancelConfirmOpen(false);
                    // todo: 삭제로직 함수 추가
                }}
            />
        </>
    );

}
