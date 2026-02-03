package egovframework.let.production.plan.domain.model;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.math.BigDecimal;

@Schema(description = "월별 생산계획/실적 일자별 집계 행")
@Getter
@Setter
public class ProductionPlanMonthlyDailyRow implements Serializable {

    private static final long serialVersionUID = 1L;

    @Schema(description = "작업장 코드")
    private String workplaceCode;

    @Schema(description = "작업장 명")
    private String workplaceName;

    @Schema(description = "계획일자 (YYYYMMDD)")
    private String planDate;

    @Schema(description = "계획수량 합계")
    private BigDecimal planQty;

    @Schema(description = "실적수량 합계")
    private BigDecimal actualQty;
}
