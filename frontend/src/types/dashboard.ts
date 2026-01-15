/**
 * 대시보드 관련 타입 정의
 */

/**
 * 생산 진행 현황
 */
export interface ProductionProgress {
  planNo: string;
  planSeq: number;
  planDate: string;
  itemCode: string;
  itemName: string;
  itemSpec?: string;
  customerCode?: string;
  customerName?: string;
  workplaceCode?: string;
  workplaceName?: string;
  equipmentCode?: string;
  equipmentName?: string;
  workerCode?: string;
  workerName?: string;
  shift?: string;
  plannedQty: number;
  actualQty: number;
  remainingQty: number;
  goodQty: number;
  defectQty: number;
  completionRate: number;
  defectRate: number;
  planStatus: string;
  planStatusName: string;
  startTime?: string;
  endTime?: string;
  remark?: string;
}

/**
 * 생산 진행 현황 응답
 */
export interface ProductionProgressResponse {
  resultCode: number;
  resultMessage: string;
  progress: ProductionProgress;
}

/**
 * 생산 진행 현황 목록 응답
 */
export interface ProductionProgressListResponse {
  resultCode: number;
  resultMessage: string;
  resultList: ProductionProgress[];
  resultCnt: number;
  planDate?: string;
}

/**
 * 진행 상태 타입
 */
export type ProgressStatus =
  | 'PLANNED' // 계획
  | 'ORDERED' // 지시
  | 'IN_PROGRESS' // 진행중
  | 'COMPLETED' // 완료
  | 'PAUSED' // 중단
  | 'CANCELLED'; // 취소

/**
 * 진행 상태 정보
 */
export interface ProgressStatusInfo {
  status: ProgressStatus;
  label: string;
  color:
    | 'default'
    | 'primary'
    | 'secondary'
    | 'error'
    | 'warning'
    | 'info'
    | 'success';
  icon?: string;
}

/**
 * 공정별 진행 현황
 */
export interface ProcessProgress {
  processSeq: number;
  processCode: string;
  processName: string;
  workplaceCode: string;
  workplaceName: string;
  equipmentCode?: string;
  equipmentName?: string;
  workerCode?: string;
  workerName?: string;
  plannedQty: number;
  actualQty: number;
  goodQty: number;
  defectQty: number;
  completionRate: number;
  processStatus: string;
  processStatusName: string;
  isFinalProcess?: string; // 'Y' or 'N'
  startTime?: string;
  endTime?: string;
  remark?: string;
}

/**
 * 공정별 진행 현황 목록 응답
 */
export interface ProcessProgressListResponse {
  resultCode: number;
  resultMessage: string;
  resultList: ProcessProgress[];
  resultCnt: number;
}

/**
 * 대시보드 KPI 통계
 */
export interface DashboardKPI {
  planDate: string;
  totalPlanCount: number; // 금일 계획 건수
  totalPlannedQty: number; // 금일 계획 수량
  completedPlanCount: number; // 완료 건수
  completedQty: number; // 완료 수량
  inProgressPlanCount: number; // 진행중 건수
  inProgressQty: number; // 진행중 수량
  totalActualQty: number; // 금일 실적 수량
  totalGoodQty: number; // 양품 수량
  totalDefectQty: number; // 불량 수량
  completionRate: number; // 전체 완료율 (%)
  defectRate: number; // 불량률 (%)
}

/**
 * 대시보드 KPI 응답
 */
export interface DashboardKPIResponse {
  resultCode: number;
  resultMessage: string;
  kpi: DashboardKPI;
}

/**
 * 작업장별 생산 현황
 */
export interface WorkplaceProgress {
  workplaceCode: string;
  workplaceName: string;
  planCount: number;
  plannedQty: number;
  actualQty: number;
  goodQty: number;
  defectQty: number;
  completionRate: number;
}

/**
 * 작업장별 생산 현황 응답
 */
export interface WorkplaceProgressResponse {
  resultCode: number;
  resultMessage: string;
  resultList: WorkplaceProgress[];
  resultCnt: number;
  planDate?: string;
}

/**
 * 알림 유형
 */
export type AlertType =
  | 'EQUIPMENT_FAILURE' // 설비 고장
  | 'QUALITY_ISSUE' // 품질 이슈
  | 'MATERIAL_SHORTAGE' // 자재 부족
  | 'DELAY_WARNING'; // 지연 경고

/**
 * 알림 우선순위
 */
export type AlertPriority = 'HIGH' | 'MEDIUM' | 'LOW';

/**
 * 대시보드 알림/이슈
 */
export interface DashboardAlert {
  alertId: string;
  alertType: AlertType;
  priority: AlertPriority;
  message: string;
  planSeq: string;
  itemCode: string;
  itemName: string;
  workplaceCode: string;
  workplaceName: string;
  occurredAt: string;
  isResolved: string;
  resolvedAt?: string;
}

/**
 * 대시보드 알림 응답
 */
export interface DashboardAlertResponse {
  resultCode: number;
  resultMessage: string;
  resultList: DashboardAlert[];
  resultCnt: number;
  planDate?: string;
}
