import { ProcessFlow } from '../../../types/processFlow';

export type Yn = 'Y' | 'N';

export type ProcessFlowSummary = Pick<
  ProcessFlow,
  'processFlowId' | 'processFlowCode' | 'processFlowName'
>;

export type ProcessFlowProcessDto = {
  flowProcessId: string;
  flowProcessCode: string;
  flowProcessName: string;
  equipmentFlag: Yn;
  seq: number;
  planFlag: Yn;
  lastFlag: Yn;
};

export type ProcessFlowProcessDraft = Omit<
  ProcessFlowProcessDto,
  'flowProcessId'
> & {
  rowId: string;
  flowProcessId: string | null;
};

export type ProcessFlowItemDto = {
  flowItemId: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  specification?: string;
  unit?: string;
  unitName?: string;
};

export type ProcessFlowItemDraft = Omit<ProcessFlowItemDto, 'flowItemId'> & {
  rowId: string;
  flowItemId: string | null;
};

export type ApiResult<T> = {
  resultCode: number;
  resultMessage?: string;
  result?: T;
};

export type SaveFlowProcessesRequest = {
  processes: Array<
    Pick<ProcessFlowProcessDraft, 'flowProcessCode' | 'seq' | 'planFlag' | 'lastFlag'>
  >;
};

export type SaveFlowProcessesResult = {
  processes: ProcessFlowProcessDto[];
};

export type SaveFlowItemsDeltaRequest = {
  addItemIds: string[];
  deleteFlowItemIds: string[];
};

export type SaveFlowItemsDeltaResult = {
  addedItems: ProcessFlowItemDto[];
  deletedFlowItemIds: string[];
};

export type ProcessFlowListParams = {
  page: number;
  pageSize: number;
  searchCnd?: string;
  searchWrd?: string;
};

export type CatalogParams = ProcessFlowListParams & {
  useYn?: string;
};
