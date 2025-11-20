import {useForm} from "react-hook-form";
import {ProcessFlow} from "../../../../types/processFlow";
import {yupResolver} from "@hookform/resolvers/yup";
import {processFlowSchema} from "../processFlowSchema";
import {useEffect, useState} from "react";
import workplaceService from "../../../../services/workplaceService";
import {Workplace} from "../../../../types/workplace";

interface Props {
    mode: "create" | "edit";
    initialData: ProcessFlow | null;
    onSubmit: (data: ProcessFlow) => void;
}

export function useProcessFlowDialog({ mode, initialData, onSubmit }: Props) {

    const [workplaces, setWorkplaces] = useState<Workplace[]>([]);


    // react-hook-form 설정 - 공정흐름
    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<ProcessFlow>({
        resolver: yupResolver(processFlowSchema),
        defaultValues: {
            processFlowCode: "",
            processFlowName: "",
            workplaceCode: "",
        },
    });


    // 작업장 리스트 조회
    useEffect(() => {
        (async () => {
            const data = await workplaceService.getWorkplaceList(0, 9999);
            setWorkplaces(data?.result?.resultList ?? []);
        })();
    }, []);

    // 모드가 바뀌거나 initialData가 바뀔 때 폼 갱신
    useEffect(() => {
        if (mode === "edit" && initialData) {
            reset(initialData);
        } else if (mode === "create") {
            reset({
                processFlowCode: "",
                processFlowName: "",
                workplaceCode: "",
            });
        }
    }, [mode, initialData, reset]);

    // 최종 submit 함수
    const submitForm = handleSubmit((data) => {
        onSubmit(data);
    });

    return {
        control,
        errors,
        submitForm,
        workplaces,
    };
}