package egovframework.let.production.kpi.domain.model;

import lombok.Data;

import java.io.Serializable;

/**
 * 작업장 KPI - 로우 데이터 조회 결과 행
 */
@Data
public class WorkplaceKpiRow implements Serializable {
    private static final long serialVersionUID = 1L;

    private Integer kpiSeq;
    private String factoryCode;
    private String workcenterCode;
    private String processType;
    private String workDate;        // yyyyMMdd
    private String workOrderNo;
    private String itemName;
    private String itemCode;
    private Double prodQty;
    private Double goodQty;
    private Double badQty;
    private Double badRate;
    private Double workTime;
    private Double qtyPerHour;
    private String regDt;
    private String regId;
}
