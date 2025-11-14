/**
 * 생산의뢰 (TSA308 테이블) 관련 타입 정의
 */

export interface ProductionRequest {
  // TSA308 테이블 필드
  factoryCode?: string;           // FACTORY_CODE: varchar(10) (FK)
  orderNo?: string;                // ORDER_NO: varchar(12) (FK)
  orderHistno?: number;            // ORDER_HISTNO: int (FK)
  orderSeqno?: number;             // ORDER_SEQNO: int
  
  itemFlag?: string;               // ITEM_FLAG: char(1)
  orderQty?: number;               // ORDER_QTY: float(15)
  orderPrice?: number;             // ORDER_PRICE: money
  orderAmount?: number;            // ORDER_AMOUNT: money
  shipOrderQty?: number;           // SHIP_ORDER_QTY: float(15)
  closingFlag?: string;            // CLOSING_FLAG: char(1)
  deliveryDate?: string;           // DELIVERY_DATE: char(8)
  closingDate?: string;            // CLOSING_DATE: char(8)
  vatFlag?: string;                // VAT_FLAG: char(1)
  opmanCode?: string;              // OPMAN_CODE: varchar(10)
  optime?: string;                 // OPTIME: char(12)
  itemCode?: string;               // ITEM_CODE: varchar(15) (FK)

  // 생산의뢰 팝업에 표시할 추가 정보
  itemName?: string;               // 품목명 (조인하여 가져올 데이터)
  specification?: string;          // 규격
  unit?: string;                   // 단위
  registrant?: string;             // 등록자
  registTime?: string;             // 등록시간
  registDate?: string;             // 등록일자
}

/**
 * 생산계획 관련 타입 정의
 */
export interface ProductionPlan {
  // TPR301M 테이블 필드
  factoryCode?: string;            // FACTORY_CODE: varchar(6)
  prodplanDate?: string;           // PRODPLAN_DATE: char(8)
  prodplanSeq?: number;            // PRODPLAN_SEQ: int
  
  prodplanEndDate?: string;        // PRODPLAN_END_DATE: varchar(8)
  lotNo?: string;                  // LOT_NO: varchar(20)
  itemCode?: string;               // ITEM_CODE: varchar(15)
  orderFlag?: string;              // ORDER_FLAG: char(1)
  prodQty?: number;                // PROD_QTY: float
  opmanCode?: string;              // OPMAN_CODE: varchar(10)
  optime?: string;                 // OPTIME: varchar(12)
  opmanCode2?: string;             // OPMAN_CODE2: varchar(10)
  optime2?: string;                // OPTIME2: varchar(12)

  // TPR301R 테이블 필드 (생산계획상세)
  orderNo?: string;                // ORDER_NO: varchar(12) (FK)
  orderSeqno?: number;             // ORDER_SEQNO: int (FK)
  orderHistno?: number;            // ORDER_HISTNO: int (FK)
  orderQty?: number;               // ORDER_QTY: float
  workdtQty?: number;              // WORKDT_QTY: float
  representOrder?: string;         // REPRESENT_ORDER: char(1)

  // 화면 표시용 추가 필드
  itemName?: string;               // 품목명
  equipmentCode?: string;          // 설비코드
  equipmentName?: string;          // 설비명
}

export interface ProductionRequestSearchParams {
  factoryCode?: string;
  orderNo?: string;
  itemCode?: string;
  itemName?: string;
  dateFrom?: string;
  dateTo?: string;
  pageIndex?: number;
  pageUnit?: number;
}
