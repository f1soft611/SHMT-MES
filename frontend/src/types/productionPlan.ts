// 생산계획 관련 공통 타입 (UI 전용 데이터 구조)
// 서비스 계층(ProductionPlan)과 달리 date(YYYY-MM-DD) 형식을 사용하며 UI 편의 필드(id 등)를 포함합니다.
export interface ProductionPlanData {
  id?: string; // UI에서 planNo-planSeq 조합 등으로 생성되는 식별자
  // 기본 계획 정보
  date: string; // YYYY-MM-DD (planDate 가공)
  itemCode: string;
  itemDisplayCode?: string; // UI 노출용 품목코드 (백엔드 저장용 itemCode와 분리)
  itemName: string;
  plannedQty: number;
  equipmentId?: string;
  equipmentCode: string;
  equipmentName?: string;
  shift?: string; // DAY / NIGHT 등
  remark?: string;
  // 생성일수/묶음 정보
  createDays?: number;
  planGroupId?: string;
  groupSeq?: number;
  totalGroupCount?: number;
  // 생산의뢰 연동 정보
  orderNo?: string;
  orderSeqno?: number;
  orderHistno?: number;
  // 작업장/공정/작업자 정보
  workplaceCode?: string;
  workplaceName?: string;
  processCode?: string;
  processName?: string;
  workerCode?: string;
  workerName?: string;
  // 거래처 정보
  customerCode?: string;
  customerName?: string;
  additionalCustomers?: string[]; // 다수 거래처 표시용
  // 납기일
  deliveryDate?: string; // YYYY-MM-DD 또는 YYYYMMDD
  // 백엔드 원본 필드(선택적으로 활용)
  planNo?: string;
  planSeq?: number;
  factoryCode?: string;
  actualQty?: number;
  lotNo?: string;
  useYn?: string;
  // 상태 정보
  orderFlag?: string; // ORDERED: 생산지시 완료, PLANNED: 계획만 등록
}

export type ProductionPlanFormUpdates = Partial<ProductionPlanData>;
