export interface BomItemSearchRow {
  itemSeq: number;
  itemNo: string;
  itemName: string;
  itemSpec: string | null;
}

export interface BomTreeNode {
  key: string;
  nodeType: 'PROCESS' | 'MATERIAL';
  itemSeq: number;
  label: string;
  itemNo?: string | null;
  itemSpec?: string | null;
  procSeq?: number | null;
  needQty?: number | null;
  unitName?: string | null;
  children: BomTreeNode[];
}
