export type ProdPlanResultRowType = 'PLAN' | 'ACTUAL' | 'RATE';

export interface ProdPlanResultRow {
  workplaceCode: string;
  workplaceName: string;
  rowType: ProdPlanResultRowType;
  rowTypeName: string;
  monthTarget: number;
  monthPlan: number;
  orderBacklog: number;
  nextMonthCarry: number;
  total: number;
  days: number[];
  weekTotals: number[];
}
