package egovframework.let.production.plan.domain.model;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.math.BigDecimal;

@Schema(description = "월별 수주/잔량 집계")
@Getter
@Setter
public class ProductionPlanMonthlyOrderSummary implements Serializable {

    private static final long serialVersionUID = 1L;

    @Schema(description = "작업장 코드")
    private String workplaceCode;

    @Schema(description = "수주 수량 합계")
    private BigDecimal orderQty;

    @Schema(description = "수주 잔량 합계")
    private BigDecimal backlogQty;
}
