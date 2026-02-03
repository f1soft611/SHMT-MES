package egovframework.let.production.plan.domain.model;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.List;

@Schema(description = "월별 생산계획 대비 실적 현황 행")
@Getter
@Setter
public class ProductionPlanMonthlyResultRow implements Serializable {

    private static final long serialVersionUID = 1L;

    @Schema(description = "작업장 코드")
    private String workplaceCode;

    @Schema(description = "작업장 명")
    private String workplaceName;

    @Schema(description = "구분 코드 (PLAN/ACTUAL/RATE)")
    private String rowType;

    @Schema(description = "구분 명")
    private String rowTypeName;

    @Schema(description = "금월 생산목표")
    private BigDecimal monthTarget;

    @Schema(description = "금월 계획")
    private BigDecimal monthPlan;

    @Schema(description = "수주잔량")
    private BigDecimal orderBacklog;

    @Schema(description = "차월 이월")
    private BigDecimal nextMonthCarry;

    @Schema(description = "월 합계")
    private BigDecimal total;

    @Schema(description = "일자별 수량 (1~31)")
    private List<BigDecimal> days;

    @Schema(description = "주차 소계 (1~5주)")
    private List<BigDecimal> weekTotals;
}
