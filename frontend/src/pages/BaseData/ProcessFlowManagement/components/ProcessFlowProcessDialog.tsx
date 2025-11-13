import React from "react";
import {
    Stack,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
} from "@mui/material";
import { Controller, Control, FieldErrors } from "react-hook-form";
import { ProcessFlowProcess } from "../../../../types/processFlow";

interface Props {
    open: boolean;
    dialogMode: "create" | "edit";
    onClose: () => void;
    // onSave: () => void;
}

export default function ProcessFlowProcessDialog({
                                              open,
                                              dialogMode,
                                              onClose,
                                          }: Props) {
    return (
        <Dialog open={open} maxWidth="md" fullWidth>
            <DialogTitle>
                {dialogMode === "create" ? "공정 등록" : "공정 수정"}
            </DialogTitle>

            <DialogContent>
                <Stack spacing={2} sx={{ mt: 1 }}>
                    <Stack direction="row" spacing={2}>
                        <Controller
                            name="processCode"
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="공정 코드"
                                    fullWidth
                                    size="small"
                                />
                            )}
                        />

                        {/* 공정흐름명 */}
                        <Controller
                            name="processName"
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="공정명"
                                    fullWidth
                                    size="small"
                                />
                            )}
                        />
                    </Stack>
                </Stack>
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