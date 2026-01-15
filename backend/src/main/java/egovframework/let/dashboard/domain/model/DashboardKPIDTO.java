package egovframework.let.dashboard.domain.model;

import lombok.Data;

/**
 * 대시보드 KPI 통계 DTO
 */
@Data
public class DashboardKPIDTO {
    private String planDate;
    private int totalPlanCount; // 금일 계획 건수
    private int totalPlannedQty; // 금일 계획 수량
    private int completedPlanCount; // 완료 건수
    private int completedQty; // 완료 수량
    private int inProgressPlanCount; // 진행중 건수
    private int inProgressQty; // 진행중 수량
    private int totalActualQty; // 금일 실적 수량
    private int totalGoodQty; // 양품 수량
    private int totalDefectQty; // 불량 수량
    
    /**
     * 완료율 계산
     */
    public double getCompletionRate() {
        if (totalPlannedQty == 0) return 0.0;
        return Math.round((double) totalActualQty / totalPlannedQty * 1000.0) / 10.0;
    }
    
    /**
     * 불량률 계산
     */
    public double getDefectRate() {
        if (totalActualQty == 0) return 0.0;
        return Math.round((double) totalDefectQty / totalActualQty * 1000.0) / 10.0;
    }
}
