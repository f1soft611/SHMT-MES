package egovframework.let.production.stock.domain.model;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;
import org.apache.commons.lang3.builder.ToStringBuilder;

import java.io.Serializable;
import java.math.BigDecimal;

/**
 * 재고조회 데이터 모델 클래스
 * @author SHMT-MES
 * @since 2026.02.13
 * @version 1.0
 * @see
 *
 * <pre>
 * << 개정이력(Modification Information) >>
 *
 *   수정일      수정자           수정내용
 *  -------    --------    ---------------------------
 *   2026.02.13 SHMT-MES          최초 생성
 *
 * </pre>
 */
@Schema(description = "재고조회 모델")
@Getter
@Setter
public class StockInquiry implements Serializable {

	/**
	 *  serialVersion UID
	 */
	private static final long serialVersionUID = 1L;

	@Schema(description = "품목코드")
	private Integer itemSeq;

	@Schema(description = "품번")
	private String itemNo = "";

	@Schema(description = "품명")
	private String itemName = "";

	@Schema(description = "창고코드")
	private Integer whSeq;

	@Schema(description = "창고명")
	private String whName = "";

	@Schema(description = "재고수량")
	private BigDecimal stockQty = BigDecimal.ZERO;

	@Schema(description = "단위")
	private String unit = "";

	@Schema(description = "조회일자From (YYYYMMDD)")
	private String dateFr = "";

	@Schema(description = "조회일자To (YYYYMMDD)")
	private String dateTo = "";

	@Override
	public String toString() {
		return ToStringBuilder.reflectionToString(this);
	}
}
