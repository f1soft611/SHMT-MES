package egovframework.let.production.order.domain.model;

import lombok.Data;

@Data
public class StopWorkDto {

    /** 생산계획일 (YYYYMMDD) */
    private String prodplanDate;

    /** 생산계획 SEQ */
    private int prodplanSeq;

    /** 생산작업 SEQ */
    private int prodworkSeq;

    /** 변경수량 — TPR301.PROD_QTY 에만 반영 */
    private int prodQty;

    /** 처리자 코드 — 컨트롤러에서 로그인 사용자로 세팅 */
    private String opmanCode;
}
