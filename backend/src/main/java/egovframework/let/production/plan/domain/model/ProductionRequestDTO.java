package egovframework.let.production.plan.domain.model;

import lombok.Data;

/**
 * 생산의뢰 (TSA308) 테이블 DTO
 * @author SHMT-MES
 * @since 2025.11.27
 * @version 1.0
 */
@Data
public class ProductionRequestDTO {
    // TSA308 테이블 필드
    private String factoryCode;         // FACTORY_CODE: varchar(10) (FK)
    private String orderNo;             // ORDER_NO: varchar(12) (FK)
    private Integer orderHistno;        // ORDER_HISTNO: int (FK)
    private Integer orderSeqno;         // ORDER_SEQNO: int
    
    private String itemFlag;            // ITEM_FLAG: char(1)
    private Double orderQty;            // ORDER_QTY: float(15)
    private Double orderPrice;          // ORDER_PRICE: money
    private Double orderAmount;         // ORDER_AMOUNT: money
    private Double shipOrderQty;        // SHIP_ORDER_QTY: float(15)
    private String closingFlag;         // CLOSING_FLAG: char(1)
    private String deliveryDate;        // DELIVERY_DATE: char(8)
    private String closingDate;         // CLOSING_DATE: char(8)
    private String vatFlag;             // VAT_FLAG: char(1)
    private String opmanCode;           // OPMAN_CODE: varchar(10)
    private String optime;              // OPTIME: char(12)
    private String itemCode;            // ITEM_CODE: varchar(15) (FK)
    
    // 조인하여 가져올 추가 정보
    private String itemName;            // 품목명 (ITEM_NAME from TSA101)
    private String specification;       // 규격 (SPECIFICATION from TSA101)
    private String unit;                // 단위 (UNIT from TSA101)
    private String registrant;          // 등록자 (OPMAN_CODE 기준)
    private String registTime;          // 등록시간 (OPTIME)
    private String registDate;          // 등록일자 (DELIVERY_DATE or 별도 필드)
    private String customerCode;        // 거래처 코드 (ORDER 테이블과 조인 시)
    private String customerName;        // 거래처명 (ORDER 테이블과 조인 시)
}
