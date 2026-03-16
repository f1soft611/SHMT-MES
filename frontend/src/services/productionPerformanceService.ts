import apiClient from './api';
import {ApiResponse, ListResult} from "../types";
import {ProdPerfRow, ProdPerfSearchParams} from "../types/productionPerformance";

export const productionPerformanceService = {

    getProdPerfList: async (params?: ProdPerfSearchParams): Promise<ApiResponse<ListResult<ProdPerfRow>>> => {
        const response = await apiClient.get('/api/production-performance', { params })
        return response.data;
    }

}