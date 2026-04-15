package egovframework.let.production.kpi.domain.model;

import lombok.Data;

import java.io.Serializable;

/**
 * 작업장 KPI - 업로드 입력 단건 DTO (엑셀 행 1개)
 */
@Data
public class WorkplaceKpiReqDTO implements Serializable {
    private static final long serialVersionUID = 1L;

    /** 공장코드 */
    private String factoryCode;
    /** 작업장코드 */
    private String workcenterCode;
    /** 공정 구분 (MG 등) */
    private String processType;
    /** 작업일 (yyyyMMdd) */
    private String workDate;
    /** 작업지시번호 */
    private String workOrderNo;
    /** 품명 */
    private String itemName;
    /** 품번 */
    private String itemCode;
    /** 생산수량 */
    private Double prodQty;
    /** 양품수량 */
    private Double goodQty;
    /** 불량수량 */
    private Double badQty;
    /** 불량률 (%) */
    private Double badRate;
    /** 작업시간 (h) */
    private Double workTime;
    /** 시간당 생산량 */
    private Double qtyPerHour;
    /** 등록자 ID (서비스에서 설정) */
    private String regId;
}
