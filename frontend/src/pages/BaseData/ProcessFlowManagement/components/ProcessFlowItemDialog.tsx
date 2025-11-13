import React, {useEffect, useState} from "react";
import {
    Stack,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
} from "@mui/material";
import { ProcessFlowItem } from "../../../../types/processFlow";
import {DataGrid, GridColDef} from "@mui/x-data-grid";
import itemService from "../../../../services/itemService";

interface Props {
    open: boolean;
    dialogMode: "create" | "edit";
    onClose: () => void;
    // onSelect:() => void;
    // onSave: () => void;
}

export default function ProcessFlowItemDialog({
                                              open,
                                              dialogMode,
                                              onClose,
                                                  // onSelect,
                                          }: Props) {
    const [items, setItems] = useState<ProcessFlowItem[]>([]);

    useEffect(() => {
        if (!open) return;

        const fetchData = async () => {
            try {
                // 전체 품목 목록 조회 API
                const data = await itemService.getItemList(0, 9999);
                const list = data?.result?.resultList ?? [];
                setItems(list);
            } catch (e) {
                console.error("제품 조회 실패:", e);
            }
        };

        fetchData();
    }, [open]);

    const columns: GridColDef[] = [
        {
            field: "itemCode",
            headerName: "제품 코드",
            headerAlign:'center',
            flex: 1
        },
        {
            field: "itemName",
            headerName: "제품명",
            headerAlign:'center',
            flex: 1
        },
        {
            field: "itemSpec",
            headerName: "규격",
            headerAlign:'center',
            flex: 1
        },
        {
            field: "itemUnit",
            headerName: "단위",
            headerAlign:'center',
            flex: 0.8
        },
    ];


    return (
        <Dialog open={open} maxWidth="md" fullWidth>
            <DialogTitle>
                {dialogMode === "create" ? "제품 등록" : "제품 수정"}
            </DialogTitle>

            <DialogContent>
                <DataGrid
                    rows={items}
                    columns={columns}
                    autoHeight
                    hideFooter
                    disableRowSelectionOnClick
                />
            </DialogContent>

            <DialogActions>
                <Button
                    // onClick={onSave}
                    variant="contained"
                    color="primary"
                >
                    저장
                </Button>
                <Button onClick={onClose}>취소</Button>
            </DialogActions>
        </Dialog>
    );
}