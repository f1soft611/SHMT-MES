// 공정흐름 등록 유효성 검사 스키마
import {ProcessFlow} from "../../../types/processFlow";
import * as yup from 'yup';

export const processFlowSchema: yup.ObjectSchema<ProcessFlow> = yup.object({
    processFlowId: yup.string().nullable(),
    workplaceCode: yup.string().required('작업장은 필수입니다.'),
    processFlowCode: yup.string().required('코드는 필수입니다.'),
    processFlowName: yup.string().required('이름은 필수입니다.')
});