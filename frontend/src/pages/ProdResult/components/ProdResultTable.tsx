import React, { useMemo, useRef, useState} from "react";
import {
    Box, Card, CardActions, CardContent, CardHeader,
    Collapse, Paper, IconButton,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination,
} from "@mui/material";
import {
    KeyboardArrowDown,
    KeyboardArrowUp,
    Add as AddIcon
} from "@mui/icons-material";
import {
    ProductionResultOrder,
    ProductionResultDetail
} from "../../../types/productionResult";
import ProdResultList from "./ProdResultList";

interface Props {
    rows: ProductionResultOrder[];
    rowCount: number;
    pagination: {
        page: number;
        pageSize: number;
    };
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
}

export interface DetailGridRef {
    addRow: () => void;
    getRows: () => ProductionResultDetail[];
    fetchDetails: () => void;
}

export default function ProdResultTable({ rows, rowCount, pagination, onPageChange, onPageSizeChange }: Props) {

    return (
        <Card>
            <CardHeader
                title="생산 목록"
                titleTypographyProps={{ fontSize: 16 }}
            />
            <CardContent sx={{ p: 0 }}>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ height: 40, }}>
                                <TableCell width={40} sx={{ padding: "0 2px" }} />
                                <TableCell align="center" sx={{ padding: "0 2px" }}>수주번호</TableCell>
                                <TableCell align="center" sx={{ padding: "0 2px" }}>거래처</TableCell>
                                <TableCell align="center" sx={{ padding: "0 2px" }}>생산의뢰번호</TableCell>
                                <TableCell align="center" sx={{ padding: "0 2px" }}>공정명</TableCell>
                                <TableCell align="center" sx={{ padding: "0 2px" }}>설비코드</TableCell>
                                <TableCell align="center" sx={{ padding: "0 2px" }}>설비명</TableCell>
                                <TableCell align="center" sx={{ padding: "0 2px" }}>생산품목코드</TableCell>
                                <TableCell align="center" sx={{ padding: "0 2px" }}>생산품목명</TableCell>
                                <TableCell align="center" sx={{ padding: "0 2px" }}>생산품목규격</TableCell>
                                <TableCell align="center" sx={{ padding: "0 2px" }}>작업지시량</TableCell>
                                <TableCell align="center" sx={{ padding: "0 2px" }}>작업시작일</TableCell>
                                <TableCell align="center" sx={{ padding: "0 2px" }}>실적등록</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={11}
                                        align="center"
                                        sx={{ height: 80, color: 'text.secondary' }}
                                    >
                                        조회된 데이터가 없습니다.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                rows.map((row) => (
                                    <ProdResultRow key={row.TPR504ID} row={row} />
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </CardContent>
            <CardActions sx={{ p: 0, justifyContent: 'flex-end', }} >
                <TablePagination
                    component="div"
                    count={rowCount}                 // 서버 totalCount
                    page={pagination.page}
                    rowsPerPage={pagination.pageSize}
                    onPageChange={(_, newPage) => onPageChange(newPage)}
                    onRowsPerPageChange={(e) =>
                        onPageSizeChange(parseInt(e.target.value, 10))
                    }
                    rowsPerPageOptions={[10, 20, 50, 100]}
                />
            </CardActions>
        </Card>
    );
}

function ProdResultRow({ row }: { row: ProductionResultOrder }) {
    const [open, setOpen] = useState(false);
    const detailRef = useRef<DetailGridRef>(null);

    const handleArrowClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setOpen(prev => {
            const next = !prev;
            if (next) {
                detailRef.current?.fetchDetails();
            }
            return next;
        });
    };

    const handleAddClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!open) {
            setOpen(true);      // 처음만 열기
            requestAnimationFrame(() => {
                detailRef.current?.fetchDetails();
            });
        }

        // 이미 열려 있으면 바로 행 추가
        detailRef.current?.addRow();
    };

    return (
        <>
            {/* 메인 행 */}
            <TableRow sx={{height: 40}}>
                <TableCell
                    align="center"
                    width={40}
                    sx={{ padding: "0 2px", cursor: "pointer" }}
                    onClick={handleArrowClick}
                >
                    {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                </TableCell>
                <TableCell align="center" sx={{ padding: "0 2px" }}>
                    {row.ORDER_NO}
                </TableCell>
                <TableCell align="center" sx={{ padding: "0 2px" }}>
                    {row.CUSTOMER_NAME}
                </TableCell>
                <TableCell align="center" sx={{ padding: "0 2px" }}>
                    {row.PRODPLAN_ID}
                </TableCell>
                <TableCell align="center" sx={{ padding: "0 2px" }}>
                    {row.WORK_NAME}
                </TableCell>
                <TableCell align="center" sx={{ padding: "0 2px" }}>
                    {row.EQUIP_SYS_CD}
                </TableCell>
                <TableCell align="center" sx={{ padding: "0 2px" }}>
                    {row.EQUIP_SYS_CD_NM}
                </TableCell>
                <TableCell align="center" sx={{ padding: "0 2px" }}>
                    {row.ITEM_CODE}
                </TableCell>
                <TableCell align="center" sx={{ padding: "0 2px" }}>
                    {row.ITEM_NAME}
                </TableCell>
                <TableCell align="center" sx={{ padding: "0 2px" }}>
                    {row.ITEM_SPEC}
                </TableCell>
                <TableCell align="right" sx={{ padding: "0 2px" }}>
                    {row.PROD_QTY.toLocaleString()}
                </TableCell>
                <TableCell align="center" sx={{ padding: "0 2px" }}>
                    {row.WORKDT_DATE}
                </TableCell>
                <TableCell align="center" sx={{ padding: "0 2px" }}>
                    <IconButton
                        size="small"
                        color="primary"
                        onClick={handleAddClick}
                    >
                        <AddIcon />
                    </IconButton>
                </TableCell>
            </TableRow>

            {/* 디테일 행 */}
            <TableRow>
                <TableCell colSpan={11} sx={{ p: 0 }}>
                    <Collapse in={open} timeout="auto">
                        <Box sx={{ ml:'100px', backgroundColor: '#ddd' }}>
                            <ProdResultList
                                ref={detailRef}
                                parentRow={row}
                            />
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
}
//
//
// const DetailGrid = React.forwardRef(
//     (
//         { parentRow }: DetailGridProps,
//         ref: React.ForwardedRef<DetailGridRef>
//     ) => {
//         const details = useProdResultDetail(parentRow);
//
//         useImperativeHandle(ref, () => ({
//             addRow: details.addRow,
//             getRows: () => details.rows,
//             fetchDetails: details.fetchDetails,
//         }));
//
//         function createDetailToolbar(onSave: () => void) {
//             return function DetailToolbar() {
//                 return (
//                     <GridToolbarContainer sx={{ p: 1, justifyContent: "flex-end" }}>
//                         <Button
//                             size="small"
//                             variant="contained"
//                             onClick={onSave}
//                         >
//                             저장
//                         </Button>
//                     </GridToolbarContainer>
//                 );
//             };
//         }
//
//         const columns: GridColDef[] = [
//             { field: "WORKSDATE", headerName: "작업시작일", headerAlign:'center', width: 120, type: "dateTime", editable: true },
//             { field: "PROD_STIME", headerName: "시작시간", headerAlign:'center', width: 120, editable: true },
//             { field: "WORKEDATE", headerName: "작업종료일", headerAlign:'center', width: 120, editable: true },
//             { field: "PROD_ETIME", headerName: "종료시간", headerAlign:'center', width: 120, editable: true },
//             { field: "PROD_QTY", headerName: "생산수량", headerAlign:'center', width: 120, type: "number", editable: true },
//             { field: "GOOD_QTY", headerName: "양품수량", headerAlign:'center', width: 120, type: "number", editable: true },
//             { field: "BAD_QTY", headerName: "불량수량", headerAlign:'center', width: 120, type: "number", editable: true },
//             { field: "RCV_QTY", headerName: "인수수량", headerAlign:'center', width: 120, type: "number", editable: true },
//             {
//                 field: "WORKER",
//                 headerName: "작업자",
//                 headerAlign:'center',
//                 width: 120,
//                 editable: true,
//                 renderEditCell: (params: GridRenderEditCellParams) => (
//                     <Select
//                         multiple
//                         fullWidth
//                         value={params.value || []}
//                         onChange={(e) => {
//                             params.api.setEditCellValue({
//                                 id: params.id,
//                                 field: params.field,
//                                 value: e.target.value,
//                             });
//                         }}
//                         renderValue={(selected) =>
//                             workerOptions
//                             .filter(o => selected.includes(o.value))
//                             .map(o => o.label)
//                             .join(", ")
//                         }
//                     >
//                         {workerOptions.map(opt => (
//                             <MenuItem key={opt.value} value={opt.value}>
//                                 <Checkbox checked={(params.value || []).includes(opt.value)} />
//                                 <ListItemText primary={opt.label} />
//                             </MenuItem>
//                         ))}
//                     </Select>
//                 ),
//                 renderCell: (params) =>
//                     workerOptions
//                     .filter(o => (params.value || []).includes(o.value))
//                     .map(o => o.label)
//                     .join(", "),
//             },
//             { field: "INPUTMATERIAL", headerName: "투입자재", headerAlign:'center', width: 120, editable: true },
//         ];
//
//         const Toolbar = React.useMemo(
//             () => createDetailToolbar(() => {
//                 details.handleSave();
//             }),
//             [details.handleSave]
//         );
//
//         return (
//             <DataGrid
//                 rows={details.rows}
//                 columns={columns}
//                 getRowId={(row) => row.TPR601ID}
//                 autoHeight
//                 hideFooter
//                 disableRowSelectionOnClick
//                 rowHeight={35}
//                 columnHeaderHeight={40}
//                 showToolbar
//                 slots={{
//                     toolbar: Toolbar,
//                 }}
//                 processRowUpdate={details.processRowUpdate}
//             />
//         );
//     }
// ) as React.ForwardRefExoticComponent<
//     DetailGridProps & React.RefAttributes<DetailGridRef>
// >;
