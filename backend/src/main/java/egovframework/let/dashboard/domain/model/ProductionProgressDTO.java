package egovframework.let.dashboard.domain.model;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * 생산 진행 현황 DTO
 * @author SHMT-MES
 * @since 2026.01.15
 * @version 1.0
 */
@Schema(description = "생산 진행 현황 DTO")
@Getter
@Setter
public class ProductionProgressDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    @Schema(description = "계획번호")
    private String planNo;

    @Schema(description = "계획순번")
    private Integer planSeq;

    @Schema(description = "계획일자")
    private String planDate;

    @Schema(description = "품목코드")
    private String itemCode;

    @Schema(description = "품목명")
    private String itemName;

    @Schema(description = "품목규격")
    private String itemSpec;

    @Schema(description = "거래처코드")
    private String customerCode;

    @Schema(description = "거래처명")
    private String customerName;

    @Schema(description = "작업장코드")
    private String workplaceCode;

    @Schema(description = "작업장명")
    private String workplaceName;

    @Schema(description = "설비코드")
    private String equipmentCode;

    @Schema(description = "설비명")
    private String equipmentName;

    @Schema(description = "작업자코드")
    private String workerCode;

    @Schema(description = "작업자명")
    private String workerName;

    @Schema(description = "근무구분")
    private String shift;

    @Schema(description = "계획수량")
    private BigDecimal plannedQty = BigDecimal.ZERO;

    @Schema(description = "실적수량 (최종공정 양품+불량)")
    private BigDecimal actualQty = BigDecimal.ZERO;

    @Schema(description = "진행률 계산용 수량 (공정 진행도 반영)")
    private BigDecimal progressQty = BigDecimal.ZERO;

    @Schema(description = "잔여수량")
    private BigDecimal remainingQty = BigDecimal.ZERO;

    @Schema(description = "양품수량")
    private BigDecimal goodQty = BigDecimal.ZERO;

    @Schema(description = "불량수량")
    private BigDecimal defectQty = BigDecimal.ZERO;

    @Schema(description = "달성률 (%)")
    private BigDecimal completionRate = BigDecimal.ZERO;

    @Schema(description = "불량률 (%)")
    private BigDecimal defectRate = BigDecimal.ZERO;

    @Schema(description = "계획상태")
    private String planStatus;

    @Schema(description = "계획상태명")
    private String planStatusName;

    @Schema(description = "시작일시")
    private String startTime;

    @Schema(description = "종료일시")
    private String endTime;

    @Schema(description = "비고")
    private String remark;

    /**
     * 잔여수량 계산
     */
    public void calculateRemainingQty() {
        if (plannedQty != null && actualQty != null) {
            this.remainingQty = plannedQty.subtract(actualQty);
        }
    }

    /**
     * 달성률 계산 (진행률 계산용 수량 기준)
     */
    public void calculateCompletionRate() {
        if (plannedQty != null && progressQty != null && plannedQty.compareTo(BigDecimal.ZERO) > 0) {
            this.completionRate = progressQty
                    .multiply(BigDecimal.valueOf(100))
                    .divide(plannedQty, 2, RoundingMode.HALF_UP);
        }
    }

    /**
     * 불량률 계산
     */
    public void calculateDefectRate() {
        if (actualQty != null && defectQty != null && actualQty.compareTo(BigDecimal.ZERO) > 0) {
            this.defectRate = defectQty
                    .multiply(BigDecimal.valueOf(100))
                    .divide(actualQty, 2, RoundingMode.HALF_UP);
        }
    }

    /**
     * 계산 메서드 일괄 실행
     */
    public void calculateAll() {
        calculateRemainingQty();
        calculateCompletionRate();
        calculateDefectRate();
    }

    /**
     * 계획상태명 설정
     */
    public void setPlanStatusName() {
        if (planStatus == null) return;
        
        switch (planStatus) {
            case "PLANNED":
                this.planStatusName = "계획";
                break;
            case "IN_PROGRESS":
                this.planStatusName = "진행중";
                break;
            case "COMPLETED":
                this.planStatusName = "완료";
                break;
            case "PAUSED":
                this.planStatusName = "중단";
                break;
            case "CANCELLED":
                this.planStatusName = "취소";
                break;
            default:
                this.planStatusName = planStatus;
        }
    }
}
