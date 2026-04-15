package egovframework.let.production.kpi.domain.model;

import lombok.Data;

import java.io.Serializable;

/**
 * 작업장 KPI - 차트용 일별 집계 결과 행
 */
@Data
public class WorkplaceKpiSummaryRow implements Serializable {
    private static final long serialVersionUID = 1L;

    /** 작업일 (yyyyMMdd) */
    private String workDate;
    /** 작업장코드 */
    private String workcenterCode;
    /** 공정 구분 */
    private String processType;

    /** 총 생산수량 */
    private Double totalProdQty;
    /** 총 양품수량 */
    private Double totalGoodQty;
    /** 총 불량수량 */
    private Double totalBadQty;
    /** 평균 불량률 (%) */
    private Double avgBadRate;
    /** 총 작업시간 (h) */
    private Double totalWorkTime;
    /** 평균 시간당 생산량 */
    private Double avgQtyPerHour;
    /** 데이터 행 수 */
    private Integer rowCount;
}
