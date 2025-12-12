import React, {useEffect, useState} from 'react';
import { useForm } from "react-hook-form";
import * as yup from "yup";
import workplaceService from "../../../../../services/workplaceService";
import {ProcessFlow} from "../../../../../types/processFlow";
import {yupResolver} from "@hookform/resolvers/yup";

const schema = yup.object({
    workplaceCode: yup.string().required('작업장 선택은 필수입니다.'),
    processFlowCode: yup.string().required('코드는 필수입니다.'),
    processFlowName: yup.string().required('이름은 필수입니다.')
});

export function useProcessFlowMainDialog() {

    // --------------------------------------------
    // Dialog open 여부 + mode(create/edit)
    // --------------------------------------------
    const [open, setOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
    const [selectedFlow, setSelectedFlow] = useState<ProcessFlow | null>(null);

    // --------------------------------------------
    // 작업장 목록 상태
    // --------------------------------------------
    const [workplaces, setWorkplaces] = useState<any[]>([]);
    // 작업장 리스트 조회
    useEffect(() => {
        (async () => {
            const data = await workplaceService.getWorkplaceList(0, 9999);
            setWorkplaces(data?.result?.resultList ?? []);
        })();
    }, []);

    // --------------------------------------------
    // react-hook-form
    // --------------------------------------------
    const methods = useForm<ProcessFlow>({
        resolver: yupResolver(schema),
        defaultValues: {
            workplaceCode: "",
            processFlowCode: "",
            processFlowName: "",
        },
    });

    const {
        reset,
        handleSubmit,
        formState: { errors },
    } = methods;

    // --------------------------------------------
    // Dialog 열기(신규 등록)
    // --------------------------------------------
    const handleOpenCreateDialog = () => {
        setDialogMode("create");
        setSelectedFlow(null);

        reset({
            workplaceCode: "",
            processFlowCode: "",
            processFlowName: "",
        });

        setOpen(true);
    };


    // --------------------------------------------
    // Dialog 열기(수정)
    // --------------------------------------------
    const handleOpenEditDialog = (row: ProcessFlow) => {
        setDialogMode("edit");
        setSelectedFlow(row);

        reset({
            workplaceCode: row.workplaceCode,
            processFlowCode: row.processFlowCode,
            processFlowName: row.processFlowName,
        });

        setOpen(true);
    };

    // --------------------------------------------
    // Dialog 닫기
    // --------------------------------------------
    const closeMainDialog = () => {
        setOpen(false);
        setSelectedFlow(null);

        reset({
            workplaceCode: "",
            processFlowCode: "",
            processFlowName: "",
        });
    };


    // --------------------------------------------
    // 저장/수정 처리 핸들러 (외부에서 handleSubmit으로 감싸서 사용)
    // --------------------------------------------
    const buildSubmitHandler = (onSubmit: (data: ProcessFlow, mode: "create" | "edit") => Promise<boolean>) =>
        handleSubmit(async (data) => {
            const success = await onSubmit(data, dialogMode);
        });


    return {
        open,
        dialogMode,
        selectedFlow,
        workplaces,
        methods,
        errors,

        handleOpenCreateDialog,
        handleOpenEditDialog,
        closeMainDialog,

        buildSubmitHandler,
    };

}