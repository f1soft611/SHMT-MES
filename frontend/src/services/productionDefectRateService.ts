import apiClient from './api';
import {ApiResponse, ListResult} from "../types";
import {ProductionDefectRateRow, ProductionDefectRateSearchParams} from "../types/productionDefectRate";

export const productionDefectRateService = {

    getProdDefectRateList: async (params?: ProductionDefectRateSearchParams): Promise<ApiResponse<ListResult<ProductionDefectRateRow>>> => {
        const response = await apiClient.get('/api/prod/defect-rate', { params })
        return response.data;
    }

}