package egovframework.let.dashboard.domain.model;

import lombok.Data;

/**
 * 공정별 진행 현황 DTO
 */
@Data
public class ProcessProgressDTO {
    private int processSeq;
    private String processCode;
    private String processName;
    private String workplaceCode;
    private String workplaceName;
    private String equipmentCode;
    private String equipmentName;
    private String workerCode;
    private String workerName;
    private int plannedQty;
    private int actualQty;
    private int goodQty;
    private int defectQty;
    private String processStatus;
    private String isFinalProcess; // 최종공정 여부 ('Y' or 'N')
    private String startTime;
    private String endTime;
    private String remark;
}
