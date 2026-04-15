package egovframework.let.production.kpi.domain.model;

import lombok.Data;

/**
 * 작업장 KPI - 검색 조건 VO
 */
@Data
public class WorkplaceKpiVO {
    /** 공장코드 */
    private String factoryCode;
    /** 작업장코드 */
    private String workcenterCode;
    /** 조회 년월 (yyyyMM) */
    private String yearMonth;

    // 내부 변환용 (yyyyMM → dateFrom/dateTo yyyyMMdd)
    private String dateFrom;
    private String dateTo;

    // 페이징
    private Integer offset;
    private Integer size;
}
