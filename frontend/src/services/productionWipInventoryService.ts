import api from './api';

import {
  WipInventoryRow,
  WipInventorySearchParams,
} from "../types/productionWipInventory";
import {ApiResponse, ListResult} from "../types"; 

export type {
  WipInventoryRow,
  WipInventorySearchParams,
} from "../types/productionWipInventory";

const productionWipInventoryService = {
  getWipInventoryList: async (params: WipInventorySearchParams): Promise<ApiResponse<ListResult<WipInventoryRow>>> => {
    const response = await api.get('/api/wip-inventory', { params });
    return response.data;
  },
};

export default productionWipInventoryService;
