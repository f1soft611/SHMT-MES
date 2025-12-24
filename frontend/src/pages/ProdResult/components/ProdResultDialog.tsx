import React, {useState} from "react";
import {
    Tab, Tabs, Box,
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, MenuItem, FormControl, FormHelperText,
    Card, CardContent, Typography, Divider
} from "@mui/material";

interface Props {
    open: boolean;
    order: any | null;
    rows: any[];
    onClose: () => void;
    onSubmit: () => void;
    // onAddRow: (index: number) => void;
    // onProcessRowUpdate: (newRow: any) => any;
    // canWrite: boolean;
}
interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

export default function ProdResultDialog({open, onClose, onSubmit, }:Props){
    return(
        <Dialog open={open} maxWidth="md" fullWidth>
            <DialogTitle>
                생산실적 등록
            </DialogTitle>
            <DialogContent dividers={true}>

            </DialogContent>
            <DialogActions>
                <Button
                    onClick={onSubmit}
                    variant="contained"
                    color="primary"
                    // disabled={!canWrite}
                >
                    저장
                </Button>
                <Button onClick={onClose}>취소</Button>
            </DialogActions>
        </Dialog>
    )
}