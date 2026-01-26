package egovframework.let.production.plan.domain.model;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;
import org.apache.commons.lang3.builder.ToStringBuilder;

import java.io.Serializable;
import java.math.BigDecimal;

/**
 * 생산계획 상세 데이터 모델 클래스
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
@Schema(description = "생산계획 상세 모델")
@Getter
@Setter
public class ProductionPlan implements Serializable {

	/**
	 *  serialVersion UID
	 */
	private static final long serialVersionUID = 1L;

	@Schema(description = "회사 코드")
	private String factoryCode = "000001";

	@Schema(description = "생산계획ID")
	private String prodPlanId = "";

	@Schema(description = "생산계획일자 (YYYYMMDD)")
	private String prodPlanDate = "";

	@Schema(description = "생산계획순번")
	private int prodPlanSeq = 0;

	@Schema(description = "생산계획일자 (YYYYMMDD)")
	private String planDate = "";

	@Schema(description = "묶음 ID (생성일수 그룹)")
	private String planGroupId = "";

	@Schema(description = "묶음 내 순번")
	private Integer groupSeq = 0;

	@Schema(description = "생성일수")
	private Integer createDays = 1;

	@Schema(description = "품목코드")
	private String itemCode = "";

	@Schema(description = "품목명")
	private String itemName = "";

	@Schema(description = "계획수량")
	private BigDecimal plannedQty = BigDecimal.ZERO;

	@Schema(description = "실적수량")
	private BigDecimal actualQty = BigDecimal.ZERO;

	@Schema(description = "작업장 코드")
	private String workplaceCode = "";

	@Schema(description = "작업장명")
	private String workplaceName = "";

	@Schema(description = "공정 코드")
	private String processCode = "";

	@Schema(description = "공정명")
	private String processName = "";

	@Schema(description = "설비ID")
	private String equipmentId = "";

	@Schema(description = "설비코드")
	private String equipmentCode = "";

	@Schema(description = "설비명")
	private String equipmentName = "";

	@Schema(description = "근무구분 (A/B/C/D/N)")
	private String workerType = "";

	@Schema(description = "작업자 코드")
	private String workerCode = "";

	@Schema(description = "작업자명")
	private String workerName = "";

	@Schema(description = "LOT번호")
	private String lotNo = "";

	@Schema(description = "거래처 코드")
	private String customerCode = "";

	@Schema(description = "거래처명")
	private String customerName = "";

	@Schema(description = "납기일 (YYYYMMDD)")
	private String deliveryDate = "";

	// 주문(생산의뢰) 연동 정보 - TPR301R 저장용
	@Schema(description = "생산의뢰번호")
	private String orderNo = "";

	@Schema(description = "생산의뢰 순번")
	private Integer orderSeqno = 0;

	@Schema(description = "생산의뢰 이력번호")
	private Integer orderHistno = 0;

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
