package egovframework.let.production.plan.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * 주간 생산계획 조회를 위한 DTO
 * 설비별로 주간 계획을 그룹화하여 반환
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductionPlanWeeklyDTO {
    
    /**
     * 설비별 주간 계획 목록
     */
    private List<EquipmentWeeklyPlan> equipmentPlans;
    
    /**
     * 설비별 주간 계획
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class EquipmentWeeklyPlan {
        /**
         * 계획번호
         */
        private String prodplanId;

        /**
         * 계획일자 (YYYYMMDD)
         */
        private String prodplanDate;

        /**
         * 계획순번
         */
        private Integer prodplanSeq;

        /**
         * 작업장 코드
         */
        private String workplaceCode;

        /**
         * 공정 코드
         */
        private String processCode;

        /**
         * 설비 코드
         */
        private String equipmentCode;
        
        /**
         * 설비명
         */
        private String equipmentName;
        
        /**
         * 설비 ID
         */
        private String equipmentId;
        
        /**
         * 주간 계획 (날짜별)
         * Key: YYYY-MM-DD 형식의 날짜
         * Value: 해당 날짜의 계획 목록
         */
        private Map<String, List<DailyPlan>> weeklyPlans;
    }
    
    /**
     * 일별 계획 정보 (간소화된 버전)
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DailyPlan {
        /**
         * 계획번호
         */
        private String prodplanId;

        /**
         * 계획일자 (YYYYMMDD)
         */
        private String prodplanDate;

        /**
         * 계획순번
         */
        private Integer prodplanSeq;
        
        /**
         * 품목코드 (시퀀스/ID)
         */
        private String itemCode;
        
        /**
         * 품목 표시 코드 (실제 품목코드)
         */
        private String itemDisplayCode;
        
        /**
         * 품목명
         */
        private String itemName;
        
        /**
         * 계획수량
         */
        private Double plannedQty;
        
        /**
         * 실적수량
         */
        private Double actualQty;
        
        /**
         * 근무구분 (DAY/NIGHT/SWING)
         */
        private String shift;
        
        /**
         * 작업자 코드
         */
        private String workerCode;
        
        /**
         * 작업자명
         */
        private String workerName;
        
        /**
         * 거래처 코드
         */
        private String customerCode;
        
        /**
         * 거래처명
         */
        private String customerName;
        
        /**
         * 비고
         */
        private String remark;
    }
}
