import apiClient from "./api";
import {
    ProcessFlow,
    ProcessFlowSearchParams
} from "../types/processFlow";


export const processFlowService = {
    // 전체 조회
    getProcessFlowList: async (
        page: number = 0,
        pageSize: number = 10,
        params?: ProcessFlowSearchParams
    ) => {
        const requestParams = {
            pageIndex: page + 1,
            pageUnit: pageSize,
            ...params,
        };
        const response = await apiClient.get('/api/processflow', { params: requestParams });
        return response.data;
    },

    // 등록
    createProcessFlow: (data: ProcessFlow) =>
        apiClient.post("/api/processflow", data),

    // 수정
    updateProcessFlow: (processFlowId: string, data: ProcessFlow) =>
        apiClient.put(`/api/processflow/${processFlowId}`, data),

    // 삭제
    deleteProcessFlow: (processFlowId: string) =>
        apiClient.delete(`/api/processflow/${processFlowId}`),

    // 공정흐름별 공정
    getProcessFlowProcess: async (processFlowId: string) => {
        const response = await apiClient.get(`/api/processflow/${processFlowId}/process`);
        return response.data;
    },

    // 공정흐름별 품목
    getProcessFlowItem: async (processFlowId: string) => {
        const response = await apiClient.get(`/api/processflow/${processFlowId}/item`);
        return response.data;
    },

};

export default processFlowService;