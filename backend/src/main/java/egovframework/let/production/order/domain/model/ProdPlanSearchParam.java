package egovframework.let.production.order.domain.model;

import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

@Getter
@Setter
public class ProdPlanSearchParam implements Serializable {

    private static final long serialVersionUID = 1L;

    /** 계획 시작일(YYYY-MM-DD) */
    private String dateFrom;

    /** 계획 종료일(YYYY-MM-DD) */
    private String dateTo;

    /** 생산 시작일(YYYY-MM-DD) */
    private String prodFrom;

    /** 생산 종료일(YYYY-MM-DD) */
    private String prodTo;

    /** 작업장 코드 */
    private String workplace;

    /** 설비 코드 */
    private String equipment;

    /** 통합검색 */
    private String keyword;

    /** 지시 상태 */
    private String orderFlag;

    /** 페이지 offset */
    private int offset;

    /** 페이지 size */
    private int size;
}
