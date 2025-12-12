import {useEffect, useState} from "react";
import { productionOrderService } from '../../../services/productionOrderService';

export function useProdPlan() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchProdPlan = async (params?: any) => {

        try {
            setLoading(true);
            setError(null);

            const response = await productionOrderService.getProdPlans(params);
            setRows(response.result.resultList);
        } catch (err: any) {
            setError(err.message || "생산계획 조회 실패");
            setRows([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProdPlan();
    }, []);

    return { rows, loading, fetchProdPlan };
}