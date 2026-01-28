package egovframework.let.production.order.domain.model;

import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

@Getter
@Setter
public class ProdPlanSearchParam implements Serializable {

    private static final long serialVersionUID = 1L;

    /** 조회 시작일 (YYYY-MM-DD) */
    private String dateFrom;

    /** 조회 종료일 (YYYY-MM-DD) */
    private String dateTo;

    /** 작업장 코드 */
    private String workplace;

    /** 페이징 offset */
    private int offset;

    /** 페이징 size */
    private int size;
}