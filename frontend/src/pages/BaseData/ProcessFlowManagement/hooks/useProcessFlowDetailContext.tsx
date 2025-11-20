import {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from "react";

import { Process } from "../../../../types/process";
import { Item } from "../../../../types/item";

import processService from "../../../../services/processService";
import itemService from "../../../../services/itemService";
import processFlowService from "../../../../services/processFlowService";
import {ProcessFlow, ProcessFlowItem, ProcessFlowProcess} from "../../../../types/processFlow";

interface DetailContextState {
    processRows: Process[];
    itemRows: Item[];

    flowProcessRows: ProcessFlowProcess[];
    flowItemRows: ProcessFlowItem[];

    setFlowProcessRows: React.Dispatch<React.SetStateAction<ProcessFlowProcess[]>>;
    setFlowItemRows: React.Dispatch<React.SetStateAction<ProcessFlowItem[]>>;

    processFlow: ProcessFlow | null;

    fetchDetail: (flowId: string) => Promise<void>;
}

export const ProcessFlowDetailCtx = createContext<DetailContextState | null>(null);

export function ProcessFlowDetailProvider({
                                              processFlow,
                                              children,
                                          }: {
    processFlow: ProcessFlow | null;
    children: ReactNode;
}) {
    const [processRows, setProcessRows] = useState<Process[]>([]);
    const [itemRows, setItemRows] = useState<Item[]>([]);

    const [flowProcessRows, setFlowProcessRows] = useState<ProcessFlowProcess[]>([]);
    const [flowItemRows, setFlowItemRows] = useState<ProcessFlowItem[]>([]);

    const flowId = processFlow?.processFlowId ?? null;  // ★ 공정 흐름 ID 추출

    // 전체 공정 조회
    useEffect(() => {
        (async () => {
            const res = await processService.getProcessList(0, 9999);
            setProcessRows(res?.result?.resultList ?? []);
        })();
    }, []);

    // 전체 품목 조회
    useEffect(() => {
        (async () => {
            const res = await itemService.getItemList(0, 9999);
            setItemRows(res?.result?.resultList ?? []);
        })();
    }, []);

    // 흐름별 공정 조회
    useEffect(() => {
        if (!flowId) return;
        (async () => {
            const res = await processFlowService.getProcessFlowProcess(flowId);
            setFlowProcessRows(res?.result?.resultList ?? []);
        })();
    }, [flowId]);

    // 흐름별 품목 조회
    useEffect(() => {
        if (!flowId) return;
        (async () => {
            const res = await processFlowService.getProcessFlowItem(flowId);
            setFlowItemRows(res?.result?.resultList ?? []);
        })();
    }, [flowId]);

    // 흐름 상세 재조회 함수
    const fetchDetail = async (flowId: string) => {
        const proc = await processService.getProcessList(0, 9999);
        setProcessRows(
            proc?.result?.resultList?.map((r: Process) => ({ ...r })) ?? []
        );

        const item = await itemService.getItemList(0, 9999);
        setItemRows(
            item?.result?.resultList?.map((r: Item) => ({ ...r })) ?? []
        );

        const resProc = await processFlowService.getProcessFlowProcess(flowId);
        setFlowProcessRows(
            resProc?.result?.resultList?.map((r: ProcessFlowProcess) => ({ ...r })) ?? []
        );

        const resItem = await processFlowService.getProcessFlowItem(flowId);
        setFlowItemRows(
            resItem?.result?.resultList?.map((r: ProcessFlowItem) => ({ ...r })) ?? []
        );
    };


    return (
        <ProcessFlowDetailCtx.Provider
            value={{
                processFlow,
                processRows,
                itemRows,
                flowProcessRows,
                flowItemRows,
                setFlowProcessRows,
                setFlowItemRows,
                fetchDetail,
            }}
        >
            {children}
        </ProcessFlowDetailCtx.Provider>
    );
}

export function useProcessFlowDetailContext() {
    const ctx = useContext(ProcessFlowDetailCtx);
    if (!ctx)
        throw new Error(
            "useProcessFlowDetailContext는 ProcessFlowDetailProvider 내부에서만 사용해야 합니다."
        );
    return ctx;
}
