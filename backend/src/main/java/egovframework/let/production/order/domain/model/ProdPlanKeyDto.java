package egovframework.let.production.order.domain.model;

import lombok.Data;

@Data
public class ProdPlanKeyDto {
    /** 생산계획 id */
    private String prodplanId;

    /** 생산계획 id */
    private String prodplanDetailId;

    /** 생산계획일 (YYYYMMDD) */
    private String prodplanDate;

    /** 생산계획 SEQ */
    private int prodplanSeq;

    /** 생산작업 SEQ */
    private int prodworkSeq;

    /** opmanCode */
    private String opmanCode;

    /** erp 수주번호 (ProdReqSeq) */
    private int orderSeqno;

    /** 수주번호 serl (Serl) */
    private int orderHistno;
}
