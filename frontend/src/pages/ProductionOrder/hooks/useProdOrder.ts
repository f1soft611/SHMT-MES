import {useEffect, useState} from "react";
import {productionOrderService} from "../../../services/productionOrderService";

interface ProdOrderRow {
    // 필요한 필드들 선언 (없으면 최소한 빈 객체라도 허용)
    [key: string]: any;
}


export function useProdOrder(){
    const [rows, setRows] = useState<ProdOrderRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchProdOrders = async (params?: any) => {

        try {
            setLoading(true);
            setError(null);

            const status = params.ORDER_FLAG;
            const response =
                status === "PLANNED"
                    ? await productionOrderService.getFlowProcessByPlanId(params)
                    : await productionOrderService.getProdOrdersByPlanId(params);
            setRows(response.result?.resultList ?? []);
        } catch (err: any) {
            setError(err.message || "생산지시 조회 실패");
            setRows([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProdOrders();
    }, []);

    return {
        orderRows: rows,
        loading,
        error,
        fetchProdOrders
    };
}