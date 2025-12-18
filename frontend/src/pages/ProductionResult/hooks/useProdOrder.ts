import {useEffect, useState} from 'react';
import {productionResultService} from "../../../services/productionResultService";

export function useProdOrder() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchProdOrder = async (params?: any) => {

        try {
            setLoading(true);
            setError(null);

            const response = await productionResultService.getProdOrders(params);
            setRows(response.result.resultList);
        } catch (err: any) {
            setError(err.message || "생산지시 조회 실패");
            setRows([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchProdOrder();
    }, []);

    return { rows, loading, fetchProdOrder };

}