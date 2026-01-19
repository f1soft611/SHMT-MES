package egovframework.let.dashboard.domain.model;

import lombok.Data;

/**
 * 대시보드 알림/이슈 DTO
 */
@Data
public class DashboardAlertDTO {
    
    /** 알림 ID */
    private String alertId;
    
    /** 알림 유형 (EQUIPMENT_FAILURE, QUALITY_ISSUE, MATERIAL_SHORTAGE, DELAY_WARNING) */
    private String alertType;
    
    /** 우선순위 (HIGH, MEDIUM, LOW) */
    private String priority;
    
    /** 알림 메시지 */
    private String message;
    
    /** 관련 계획번호 */
    private String planSeq;
    
    /** 관련 품목코드 */
    private String itemCode;
    
    /** 관련 품목명 */
    private String itemName;
    
    /** 작업장 코드 */
    private String workplaceCode;
    
    /** 작업장명 */
    private String workplaceName;
    
    /** 발생시각 */
    private String occurredAt;
    
    /** 해결여부 */
    private String isResolved;
    
    /** 해결시각 */
    private String resolvedAt;
    
}
