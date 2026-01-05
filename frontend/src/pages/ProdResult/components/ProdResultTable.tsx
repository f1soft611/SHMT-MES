import React, { useRef, useState} from "react";
import dayjs from "dayjs";
import {
    Box, Card, CardActions, CardContent, CardHeader,
    Collapse, Paper,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, CircularProgress,
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
    loading: boolean;
}

export interface DetailGridRef {
    addRow: () => void;
    getRows: () => ProductionResultDetail[];
    fetchDetails: () => void;
}

export default function ProdResultTable({ rows, rowCount, pagination, onPageChange, onPageSizeChange, loading }: Props) {

    return (
        <Card>
            <CardHeader
                title="생산 목록"
                titleTypographyProps={{ fontSize: 16 }}
            />
            <CardContent sx={{ p: 0 }}>
                <Box sx={{ position: 'relative' }}>
                    {loading && (
                        <Box
                            sx={{
                                position: 'absolute',
                                inset: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: 'rgba(255,255,255,0.6)',
                                zIndex: 10,
                            }}
                        >
                            <CircularProgress size={40} />
                        </Box>
                    )}
                    <TableContainer
                        component={Paper}
                        sx={{
                            overflowX: 'auto',
                            height: 500
                        }}>
                        <Table
                            sx={{
                                minWidth: 1500,
                                whiteSpace: 'nowrap',
                                tableLayout: 'fixed',
                            }}
                        >
                            <TableHead>
                                <TableRow sx={{ height: 40, }}>
                                    <TableCell width={40} sx={{ padding: "0 2px" }} />
                                    <TableCell width={120} align="center" sx={{ padding: "0 2px" }}>수주번호</TableCell>
                                    <TableCell width={100} align="center" sx={{ padding: "0 2px" }}>거래처</TableCell>
                                    <TableCell width={150} align="center" sx={{ padding: "0 2px" }}>생산의뢰번호</TableCell>
                                    <TableCell width={200} align="center" sx={{ padding: "0 2px" }}>제품명</TableCell>
                                    <TableCell width={100} align="center" sx={{ padding: "0 2px" }}>공정명</TableCell>
                                    <TableCell width={100} align="center" sx={{ padding: "0 2px" }}>설비코드</TableCell>
                                    <TableCell width={100} align="center" sx={{ padding: "0 2px" }}>설비명</TableCell>
                                    <TableCell width={150} align="center" sx={{ padding: "0 2px" }}>생산품목코드</TableCell>
                                    <TableCell width={200} align="center" sx={{ padding: "0 2px" }}>생산품목명</TableCell>
                                    <TableCell width={150} align="center" sx={{ padding: "0 2px" }}>생산품목규격</TableCell>
                                    <TableCell width={80} align="center" sx={{ padding: "0 2px" }}>작업지시량</TableCell>
                                    <TableCell width={100} align="center" sx={{ padding: "0 2px" }}>작업시작일</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rows.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={13}
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
                    <TablePagination
                        component="div"
                        count={rowCount}                 // 서버 totalCount
                        page={pagination.page}
                        rowsPerPage={pagination.pageSize}
                        onPageChange={(_, newPage) => onPageChange(newPage)}
                        onRowsPerPageChange={(e) =>
                            onPageSizeChange(parseInt(e.target.value, 10))
                        }
                        rowsPerPageOptions={[10, 20, 50]}
                    />
                </Box>
            </CardContent>
            <CardActions sx={{ display: 'none' }} />
        </Card>
    );
}

function ProdResultRow({ row }: { row: ProductionResultOrder }) {
    const [open, setOpen] = useState(false);
    const detailRef = useRef<DetailGridRef>(null);

    const toggleOpen = () => {
        setOpen(prev => {
            const next = !prev;
            if (next) {
                detailRef.current?.fetchDetails();
            }
            return next;
        });
    };

    const handleArrowClick = (e: React.MouseEvent) => {
        e.stopPropagation();   // ★ row 클릭 방지
        toggleOpen();
    };

    const EllipsisCell = ({ value }: { value: string }) => (
        <Box
            sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
            }}
            title={value}
        >
            {value}
        </Box>
    );


    return (
        <>
            {/* 메인 행 */}
            <TableRow sx={{height: 40, cursor:'pointer'}} onClick={toggleOpen} >
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
                    <EllipsisCell value={row.CUSTOMER_NAME ?? ""} />
                </TableCell>
                <TableCell align="center" sx={{ padding: "0 2px" }}>
                    {row.PRODPLAN_ID}
                </TableCell>
                <TableCell align="center" sx={{ padding: "0 2px" }}>
                    <EllipsisCell value={row.ITEM_NAME}/>
                </TableCell>
                <TableCell align="center" sx={{ padding: "0 2px" }}>
                    <EllipsisCell value={row.WORK_NAME}/>
                </TableCell>
                <TableCell align="center" sx={{ padding: "0 2px" }}>
                    {row.EQUIP_SYS_CD}
                </TableCell>
                <TableCell align="center" sx={{ padding: "0 2px" }}>
                    {row.EQUIP_SYS_CD_NM}
                </TableCell>
                <TableCell align="center" sx={{ padding: "0 2px" }}>
                    {row.PROD_CODE}
                </TableCell>
                <TableCell align="center" sx={{ padding: "0 2px" }}>
                    <EllipsisCell value={row.PROD_NAME}/>
                </TableCell>
                <TableCell align="center" sx={{ padding: "0 2px" }}>
                    <EllipsisCell value={row.PROD_SPEC}/>
                </TableCell>
                <TableCell align="right" sx={{ padding: "0 2px" }}>
                    {row.PROD_QTY.toLocaleString()}
                </TableCell>
                <TableCell align="center" sx={{ padding: "0 2px" }}>
                    {row.WORKDT_DATE
                        ? dayjs(row.WORKDT_DATE).format("YYYY-MM-DD")
                        : ""}
                </TableCell>
            </TableRow>

            {/* 디테일 행 */}
            <TableRow>
                <TableCell colSpan={13} sx={{ p: 0 }}>
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
