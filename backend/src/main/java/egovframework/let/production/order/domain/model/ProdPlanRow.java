package egovframework.let.production.order.domain.model;

import lombok.Getter;
import lombok.Setter;
import java.io.Serializable;

/**
 * 생산계획 조회 결과 DTO
 */
@Getter
@Setter
public class ProdPlanRow implements Serializable {

    private static final long serialVersionUID = 1L;

    /** 지시구분 */
    private String orderFlag;

    /** 공장코드 */
    private String factoryCode;

    /** 생산계획일 (YYYYMMDD) */
    private String prodplanDate;

    /** 생산계획순번 */
    private int prodplanSeq;

    /** 작업순번 */
    private int prodworkSeq;

    /** 생산계획 ID */
    private String prodplanId;

    /** 생산일자 */
    private String prodDate;

    /** 품목ID (TPR301.ITEM_CODE) */
    private String itemCodeId;

    /** 품목코드 (TCO403.MATERIAL_CODE) */
    private String itemCode;

    /** 품목명 */
    private String itemName;

    /** 작업장코드 */
    private String workcenterCode;

    /** 작업장명 */
    private String workcenterName;

    /** 작업코드 */
    private String workCode;

    /** 설비시스템코드 */
    private String equipSysCd;

    /** 설비명 */
    private String equipmentName;

    /** 작업자구분 */
    private String workerType;

    /** 작업자코드 */
    private String workerCode;

    /** 작업자명 */
    private String workerName;

    /** LOT 번호 */
    private String lotNo;

    /** 생산수량 */
    private Double prodQty;

    /** 작업지시순번 */
    private Integer workorderSeq;

    /** 비고 */
    private String bigo;

    /** 선택 거래처명 */
    private String selCustomerNames;

    /** 작업자1 */
    private String opmanCode;

    /** 작업시간1 */
    private String optime;

    /** 작업자2 */
    private String opmanCode2;

    /** 작업시간2 */
    private String optime2;
}