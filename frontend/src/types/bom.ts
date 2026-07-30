export interface BomItemSearchRow {
  itemSeq: number;
  itemCode: string;
  itemName: string;
  itemSpec: string | null;
}

export interface BomTreeRow {
  depth: string;
  itemSeq: number;
  itemCode: string;
  itemName: string;
  matItemSeq: number;
  matItemNo: string;
  matItemName: string;
  matItemSpec: string | null;
}
