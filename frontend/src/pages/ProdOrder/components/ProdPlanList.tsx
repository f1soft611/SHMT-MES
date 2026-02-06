import React, {useState} from "react";
import { useNavigate } from 'react-router-dom';
import {DataGrid, GridColDef, GridPaginationModel, GridToolbarContainer} from '@mui/x-data-grid';
import {
    Box, Stack,
    Card, CardContent, CardActions, IconButton, Chip, Button, CircularProgress,
} from '@mui/material';
import {
    AssignmentAdd as AssignmentAddIcon,
    Input as InputIcon,
    Save as SaveIcon,
    Delete as DeleteIcon,
} from "@mui/icons-material";
import {ProdPlanKeyDto, ProdPlanRow} from "../../../types/productionOrder";
import {useSameFlagSelection} from "../hooks/useSameFlagSelection";
import { decodeHtml } from '../../../utils/stringUtils';
import {productionOrderService} from "../../../services/productionOrderService";
import {useToast} from "../../../components/common/Feedback/ToastProvider";
import ConfirmDialog from "../../../components/common/Feedback/ConfirmDialog";

interface Props {
    rows: ProdPlanRow[];
    loading: boolean;
    onRowClick: (row: ProdPlanRow) => void;
    paginationModel: GridPaginationModel;
    totalCount: number;
    onPaginationChange: (model: GridPaginationModel) => void;
    onReload: () => void;
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

function BulkSaveToolbar({
                             onBulkOrder,onBulkCancel,
                         }: {
    onBulkOrder: () => void;
    onBulkCancel: () => void;
}) {

    return (
        <GridToolbarContainer sx={{
            px: 1.5,
            py: 0.75,
            borderBottom: '1px solid #e0e0e0',
            // backgroundColor: '#fafafa',
        }}>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                }}
            >
                {/* 타이틀 (왼쪽) */}
                <Box sx={{ fontSize: 16, fontWeight: 600 }}>
                    생산계획 목록
                </Box>

                {/* 버튼 영역 (오른쪽) */}
                <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                    <Button
                        startIcon={<SaveIcon />}
                        variant="contained"
                        size="small"
                        onClick={onBulkOrder}
                    >
                        일괄 지시
                    </Button>
                    <Button
                        startIcon={<DeleteIcon />}
                        variant="contained"
                        size="small"
                        color="error"
                        onClick={onBulkCancel}
                    >
                        일괄 취소
                    </Button>
                </Box>
            </Box>
        </GridToolbarContainer>
    );
}



const ProdPlanList = ({ rows, loading, onRowClick, paginationModel, totalCount, onPaginationChange, onReload }: Props) => {

    const { showToast } = useToast();
    const navigate = useNavigate();

    const [bulkLoading, setBulkLoading] = useState(false);
    const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);

    const {
        selectionModel,
        selectedRows,
        onSelectionChange,
        clear,
    } = useSameFlagSelection(
        rows,
        row => row.prodplanDate + row.prodplanSeq + row.prodworkSeq
    );

    const handleBulkOrder = async () => {
        if (selectedRows.length === 0) return;

        const targets = selectedRows.filter(
            row => row.orderFlag !== 'ORDERED'
        );

        if (targets.length === 0) return;

        const payload: ProdPlanKeyDto[] = targets.map(row => ({
            prodplanDate: row.prodplanDate,
            prodplanSeq: row.prodplanSeq,
            prodworkSeq: row.prodworkSeq,
        }));

        try {
            setBulkLoading(true);
            const response = await productionOrderService.bulkCreateProductionOrders(payload);
            if (response.data.resultCode !== 200){
                showToast({
                    message: response.data.resultMessage ?? "저장 실패",
                    severity: "error",
                });
                return;
            }

            showToast({
                message: response.data.resultMessage ?? "저장 성공",
                severity: "success",
            });
            clear();
            onReload();
        } catch (e){
            showToast({
                message: "서버 오류가 발생했습니다.",
                severity: "error",
            });
        } finally {
            setBulkLoading(false);
        }


    };

    const onClickBulkCancel = () => {
        if (selectedRows.length === 0) {
            showToast({
                message: "대상을 선택해주세요.",
                severity: "warning",
            });
            return;
        }

        setCancelConfirmOpen(true);
    };

    const handleBulkCancel = async () => {
        // 이미 지시된 것만 취소 대상
        const targets = selectedRows.filter(
            row => row.orderFlag === 'ORDERED'
        );

        if (targets.length === 0) {
            showToast({
                message: "취소할 생산지시가 없습니다.",
                severity: "warning",
            });
            clear();
            return;
        }

        const payload: ProdPlanKeyDto[] = targets.map(row => ({
            prodplanDate: row.prodplanDate,
            prodplanSeq: row.prodplanSeq,
            prodworkSeq: row.prodworkSeq,
        }));

        try {
            setBulkLoading(true);
            const response = await productionOrderService.bulkCancelProductionOrders(payload);

            if (response.data.resultCode !== 200) {
                showToast({
                    message: response.data.resultMessage ?? "취소 실패",
                    severity: "error",
                });
                return;
            }

            showToast({
                message: response.data.resultMessage ?? "취소 성공",
                severity: "success",
            });

            clear();
            onReload();
        } catch (e) {
            showToast({
                message: "서버 오류가 발생했습니다.",
                severity: "error",
            });
        } finally {
            setBulkLoading(false);
        }

    }

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
            renderCell: (params) => {
                const gbnFlag = params.row.orderGubunFlag === 0;
                return (
                    <Chip
                        label={params.value}
                        color={gbnFlag ? 'secondary' : 'info'}
                        size="small"
                    />
                );
            },
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
            renderCell: (params) => decodeHtml(params.value ?? ''),
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
        <>
            <Card sx={{boxShadow: 2 }}>
                <CardContent sx={{ p: 0, position: 'relative' }}>
                    {bulkLoading && (
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
                            checkboxSelection
                            disableRowSelectionOnClick
                            rowSelectionModel={selectionModel}
                            onRowSelectionModelChange={onSelectionChange}
                            getRowId={(row) => row.prodplanDate + row.prodplanSeq + row.prodworkSeq}

                            showToolbar
                            slots={{
                                toolbar: () => (
                                    <BulkSaveToolbar
                                        onBulkOrder={handleBulkOrder}
                                        onBulkCancel={onClickBulkCancel}
                                    />
                                ),
                            }}

                            pagination
                            paginationMode="server"
                            rowCount={totalCount}
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
                        />
                    </Box>
                </CardContent>
                <CardActions sx={{ display: 'none' }} />
            </Card>

            <ConfirmDialog
                open={cancelConfirmOpen}
                title="생산지시 일괄 취소"
                message={
                    <>
                        선택한 생산지시를 <b>일괄 취소</b>하시겠습니까?
                        <br />
                        <span style={{ color: '#888', fontSize: 13 }}>
                ※ 생산실적이 등록된 지시는 취소할 수 없습니다.
            </span>
                    </>
                }
                confirmText="일괄 취소"
                cancelText="닫기"
                loading={bulkLoading}
                onClose={() => setCancelConfirmOpen(false)}
                onConfirm={async () => {
                    setCancelConfirmOpen(false);
                    await handleBulkCancel();
                }}
            />
        </>

    )
}

export default ProdPlanList;