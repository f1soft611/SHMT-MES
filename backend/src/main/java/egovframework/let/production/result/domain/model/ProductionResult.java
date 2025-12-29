package egovframework.let.production.result.domain.model;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;
import org.apache.commons.lang3.builder.ToStringBuilder;

import java.io.Serializable;
import java.math.BigDecimal;

/**
 * 생산실적 상세 데이터 모델 클래스
 * @author SHMT-MES
 * @since 2025.12.22
 * @version 1.0
 * @see
 *
 * <pre>
 * << 개정이력(Modification Information) >>
 *
 *   수정일		수정자		수정내용
 *  -------		--------	---------------------------
 *  2025.12.22	SHMT-MES	최초 생성
 *
 * </pre>
 */
@Schema(description = "생산실적 상세 모델")
@Getter
@Setter
public class ProductionResult implements Serializable {

	/**
	 *  serialVersion UID
	 */
	private static final long serialVersionUID = 1L;

	@Schema(description = "회사 코드")
	private String FACTORY_CODE = "000001";

	@Schema(description = "생산계획ID")
	private String PRODPLAN_ID = "";

	@Schema(description = "생산계획일자 (YYYYMMDD)")
	private String PRODPLAN_DATE = "";

	@Schema(description = "생산계획순번")
	private int PRODPLAN_SEQ = 0;

	@Schema(description = "공정계획순번")
	private int PRODWORK_SEQ = 0;

	@Schema(description = "작업지시순번")
	private int WORK_SEQ = 0;

	@Schema(description = "생산실적순번")
	private int PROD_SEQ = 0;

	@Schema(description = "작업시작예정일")
	private String WORKDT_DATE = "";

	@Schema(description = "품목코드")
	private String ITEM_CODE = "";

	@Schema(description = "품목명")
	private String ITEM_NAME = "";

	@Schema(description = "공정코드")
	private String WORK_CODE = "";

	@Schema(description = "공정명")
	private String WORK_NAME = "";

	@Schema(description = "설비코드")
	private String EQUIP_SYS_CD = "";

	@Schema(description = "설비명")
	private String EQUIP_SYS_CD_NM = "";

	@Schema(description = "생산량")
	private BigDecimal PROD_QTY = BigDecimal.ZERO;

	@Schema(description = "양품수량")
	private BigDecimal GOOD_QTY = BigDecimal.ZERO;

	@Schema(description = "불량수량")
	private BigDecimal BAD_QTY = BigDecimal.ZERO;

	@Schema(description = "인수수량")
	private BigDecimal RCV_QTY = BigDecimal.ZERO;

	@Schema(description = "생산실적 정렬 순번")
	private Integer WORKORDER_SEQ = 0;

	@Schema(description = "진행구분")
	private String ORDER_FLAG = "";

	@Schema(description = "등록자 ID")
	private String OPMANCODE = "";

	@Schema(description = "등록일시")
	private String OPTIME = "";

	@Schema(description = "수정자 ID")
	private String OPMANCODE2 = "";

	@Schema(description = "수정일시")
	private String OPTIME2 = "";

	@Schema(description = "생산실적 id")
	private String TPR601ID = "";

	@Schema(description = "생산지시 id")
	private String TPR504ID = "";

	/**
	 * toString 메소드를 대치한다.
	 */
	public String toString(){
		return ToStringBuilder.reflectionToString(this);
	}
}
