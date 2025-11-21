package egovframework.let.production.plan.domain.model;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;
import org.apache.commons.lang3.builder.ToStringBuilder;

import java.io.Serializable;
import java.math.BigDecimal;

/**
 * 생산계획 마스터 데이터 모델 클래스
 * @author SHMT-MES
 * @since 2025.11.21
 * @version 1.0
 * @see
 *
 * <pre>
 * << 개정이력(Modification Information) >>
 *
 *   수정일      수정자           수정내용
 *  -------    --------    ---------------------------
 *   2025.11.21 SHMT-MES          최초 생성
 *
 * </pre>
 */
@Schema(description = "생산계획 마스터 모델")
@Getter
@Setter
public class ProductionPlanMaster implements Serializable {

	/**
	 *  serialVersion UID
	 */
	private static final long serialVersionUID = 1L;

	@Schema(description = "회사 코드")
	private String factoryCode = "000001";

	@Schema(description = "계획번호")
	private String planNo = "";

	@Schema(description = "계획일자 (YYYYMMDD)")
	private String planDate = "";

	@Schema(description = "작업장 코드")
	private String workplaceCode = "";

	@Schema(description = "작업장명")
	private String workplaceName = "";

	@Schema(description = "계획상태 (PLANNED/CONFIRMED/IN_PROGRESS/COMPLETED/CANCELLED)")
	private String planStatus = "PLANNED";

	@Schema(description = "총 계획수량")
	private BigDecimal totalPlanQty = BigDecimal.ZERO;

	@Schema(description = "비고")
	private String remark = "";

	@Schema(description = "사용 여부 (Y/N)")
	private String useYn = "Y";

	@Schema(description = "등록자 ID")
	private String opmanCode = "";

	@Schema(description = "등록일시")
	private String optime = "";

	@Schema(description = "수정자 ID")
	private String opmanCode2 = "";

	@Schema(description = "수정일시")
	private String optime2 = "";

	/**
	 * toString 메소드를 대치한다.
	 */
	public String toString(){
		return ToStringBuilder.reflectionToString(this);
	}
}
