import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';

import processFlowService from '../../../../../services/processFlowService';
import {
  DetailSavePayload,
  ProcessFlow,
  ProcessFlowItem,
  ProcessFlowProcess,
} from '../../../../../types/processFlow';

interface DetailContextState {
  /** 기준 데이터 */
  processFlow: ProcessFlow | null;

  flowProcessRows: ProcessFlowProcess[];
  flowItemRows: ProcessFlowItem[];
  flowItemLoading: boolean;

  setFlowProcessRows: React.Dispatch<
    React.SetStateAction<ProcessFlowProcess[]>
  >;
  setFlowItemRows: React.Dispatch<React.SetStateAction<ProcessFlowItem[]>>;

  /** 저장 payload 생성 */
  getSavePayload: (tabIndex: number) => DetailSavePayload;
}

export const ProcessFlowDetailCtx = createContext<DetailContextState | null>(
  null
);

export function ProcessFlowDetailProvider({
  processFlow,
  children,
}: {
  processFlow: ProcessFlow | null;
  children: ReactNode;
}) {
  const [flowProcessRows, setFlowProcessRows] = useState<ProcessFlowProcess[]>(
    []
  );
  const [flowItemRows, setFlowItemRows] = useState<ProcessFlowItem[]>([]);
  const [flowItemLoading, setFlowItemLoading] = useState(false);

  const flowId = processFlow?.processFlowId ?? null; // ★ 공정 흐름 ID 추출

  useEffect(() => {
    if (!flowId) return;
    processFlowService
      .getProcessFlowProcess(flowId)
      .then((res) => setFlowProcessRows(res?.result?.resultList ?? []));
  }, [flowId]);

  useEffect(() => {
    if (!flowId) return;
    setFlowItemLoading(true);
    processFlowService
      .getProcessFlowItem(flowId)
      .then((res) => setFlowItemRows(res?.result?.resultList ?? []))
      .finally(() => setFlowItemLoading(false));
  }, [flowId]);

  const getSavePayload = (tabIndex: number) =>
    tabIndex === 0 ? { processes: flowProcessRows } : { items: flowItemRows };

  return (
    <ProcessFlowDetailCtx.Provider
      value={{
        processFlow,
        flowProcessRows,
        setFlowProcessRows,
        flowItemRows,
        flowItemLoading,
        setFlowItemRows,
        getSavePayload,
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
      'useProcessFlowDetailContext는 ProcessFlowDetailProvider 내부에서만 사용해야 합니다.'
    );
  return ctx;
}
