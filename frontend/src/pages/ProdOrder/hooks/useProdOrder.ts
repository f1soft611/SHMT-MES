import {useEffect, useState} from "react";
import {productionOrderService} from "../../../services/productionOrderService";


interface ProdOrderRow {
    // 필요한 필드들 선언 (없으면 최소한 빈 객체라도 허용)
    [key: string]: any;
}


export function useProdOrder(selectedPlan: any | null) {

    const [rows, setRows] = useState<ProdOrderRow[]>([]);
    const [resultCnt, setResultCnt] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchProdOrders = async (selectedPlan?: any) => {

        try {
            setLoading(true);
            setError(null);

            const status = selectedPlan.ORDER_FLAG;
            const response =
                status === "PLANNED"
                    ? await productionOrderService.getFlowProcessByPlanId(selectedPlan)
                    : await productionOrderService.getProdOrdersByPlanId(selectedPlan);
            setRows(response.result?.resultList ?? []);
            setResultCnt(response.result?.resultCnt ?? 0);
        } catch (err: any) {
            setError(err.message || "생산지시 조회 실패");
            setRows([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!selectedPlan) return;
        fetchProdOrders(selectedPlan);
    }, [selectedPlan]);

    return {
        orderRows: rows,
        orderResultCnt: resultCnt,
        loading,
        error,
        fetchProdOrders
    };
}