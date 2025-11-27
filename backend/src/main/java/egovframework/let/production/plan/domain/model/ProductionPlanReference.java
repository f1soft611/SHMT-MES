package egovframework.let.production.plan.domain.model;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;
import org.apache.commons.lang3.builder.ToStringBuilder;

import java.io.Serializable;
import java.math.BigDecimal;

/**
 * 생산계획 참조(주문연결) 데이터 모델 클래스 (TPR301R)
 * @author SHMT-MES
 * @since 2025.11.24
 * @version 1.0
 */
@Schema(description = "생산계획 참조(주문연결) 모델")
@Getter
@Setter
public class ProductionPlanReference implements Serializable {

	private static final long serialVersionUID = 1L;

	@Schema(description = "회사 코드")
	private String factoryCode = "000001";

	@Schema(description = "주문번호")
	private String orderNo = "";

	@Schema(description = "주문순번")
	private Integer orderSeqno = 0;

	@Schema(description = "주문이력번호")
	private Integer orderHistno = 0;

	@Schema(description = "계획일자")
	private String prodplanDate = "";

	@Schema(description = "계획순번") // This seems to map to PLAN_SEQ or PLAN_NO? Based on image it has PRODPLAN_SEQ.
    // In TPR301M/TPR301 we used planNo (String) and planSeq (Integer).
    // The image shows PRODPLAN_SEQ as int.
    // Let's assume it links to the plan sequence.
	private Integer prodplanSeq = 0;

    // Based on image: ORDER_QTY, WORKDT_QTY, REPRESENT_ORDER
	@Schema(description = "주문수량")
	private BigDecimal orderQty = BigDecimal.ZERO;

	@Schema(description = "작업지시수량") // WORKDT_QTY
	private BigDecimal workdtQty = BigDecimal.ZERO;

	@Schema(description = "대표주문여부")
	private String representOrder = "N";

	@Schema(description = "거래처 코드")
	private String customerCode = "";

	public String toString(){
		return ToStringBuilder.reflectionToString(this);
	}
}
