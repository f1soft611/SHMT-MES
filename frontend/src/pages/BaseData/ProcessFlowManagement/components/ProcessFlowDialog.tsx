import React, {useEffect, useState } from "react";
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
import { Controller, Control, FieldErrors, useFormContext } from "react-hook-form";
import { ProcessFlow } from "../../../../types/processFlow";
import { workplaceService } from "../../../../services/workplaceService";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";

interface Workplace {
    workplaceId: string;
    workplaceCode: string;
    workplaceName: string;
    description?: string;
    location?: string;
    useYn?: string;
}

interface Props {
    open: boolean;
    dialogMode: "create" | "edit";
    onClose: () => void;
    onSave: (data: ProcessFlow) => void;

    control: Control<ProcessFlow>;
    errors: FieldErrors<ProcessFlow>;

    handleSubmit: any;
}

export default function ProcessFlowDialog({
                                              open,
                                              dialogMode,
                                              onClose,
                                              onSave,
                                              control,
                                              errors,
                                              handleSubmit
                                          }: Props) {

    const [workplaces, setWorkplaces] = useState<Workplace[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // ✅ page=0, pageSize=9999 로 전체 조회 효과
                const data = await workplaceService.getWorkplaceList(0, 9999);
                const list = data?.result?.resultList ?? [];
                setWorkplaces(list);
            } catch (e) {
                console.error("작업장 조회 실패:", e);
            }
        };
        fetchData();
    }, []);

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
                    onClick={handleSubmit((data: ProcessFlow) => onSave(data))}
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