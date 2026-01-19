package egovframework.let.dashboard.domain.model;

import lombok.Data;

/**
 * 작업장별 생산 진행 현황 DTO
 */
@Data
public class WorkplaceProgressDTO {
    private String workplaceCode; // 작업장 코드
    private String workplaceName; // 작업장명
    private int planCount; // 계획 건수
    private int plannedQty; // 계획 수량
    private int actualQty; // 실적 수량 (최종공정 양품+불량)
    private int progressQty; // 진행률 계산용 수량 (공정 진행도 반영)
    private int goodQty; // 양품 수량
    private int defectQty; // 불량 수량
    
    /**
     * 달성률 계산 (진행률 계산용 수량 기준)
     */
    public double getCompletionRate() {
        if (plannedQty == 0) return 0.0;
        return Math.round((double) progressQty / plannedQty * 1000.0) / 10.0;
    }
}
