import React from "react";
import {
    Stack,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    MenuItem,
    FormControl,
    FormHelperText,
} from "@mui/material";
import { Controller } from "react-hook-form";
import { ProcessFlow } from "../../../../types/processFlow";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import { useProcessFlowDialog } from "../hooks/useProcessFlowDialog";


interface Props {
    open: boolean;
    dialogMode: "create" | "edit";
    initialData: ProcessFlow | null;
    onClose: () => void;
    onSubmit: (data: ProcessFlow) => void;
}

export default function ProcessFlowDialog({
                                            open,
                                            dialogMode,
                                            initialData,
                                            onClose,
                                            onSubmit
                                        }: Props) {

    const {
        control,
        errors,
        submitForm,
        workplaces
    } = useProcessFlowDialog({
        mode: dialogMode,
        initialData,
        onSubmit
    });

    return (
        <Dialog open={open} maxWidth="md" fullWidth>
            <DialogTitle>
                {dialogMode === "create" ? "공정흐름 등록" : "공정흐름 수정"}
            </DialogTitle>

            <DialogContent dividers={true}>
                <Stack spacing={2} sx={{ mt: 1 }}>
                    <Stack direction="row" spacing={2}>
                        {/* 작업장 선택*/}
                        <Controller
                            name="workplaceCode"
                            control={control}
                            render={({ field }) => (
                                <FormControl fullWidth size="small" error={!!errors.workplaceCode}>
                                    <InputLabel>작업장</InputLabel>
                                    <Select {...field} label="작업장">
                                        {workplaces.map((wp) => (
                                            <MenuItem key={wp.workplaceId} value={wp.workplaceCode}>
                                                {wp.workplaceName}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    <FormHelperText>{errors.workplaceCode?.message}</FormHelperText>
                                </FormControl>
                            )}
                        />

                        {/* 공정흐름 코드 */}
                        <Controller
                            name="processFlowCode"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="공정흐름 코드"
                                    fullWidth
                                    size="small"
                                    error={!!errors.processFlowCode}
                                    helperText={errors.processFlowCode?.message}
                                    disabled={dialogMode === "edit"}
                                />
                            )}
                        />


                        {/* 공정흐름명 */}
                        <Controller
                            name="processFlowName"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="공정흐름명"
                                    fullWidth
                                    size="small"
                                    error={!!errors.processFlowName}
                                    helperText={errors.processFlowName?.message}
                                />
                            )}
                        />
                    </Stack>

                </Stack>
            </DialogContent>

            <DialogActions>
                <Button
                    onClick={submitForm}
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