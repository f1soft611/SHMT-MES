package egovframework.let.basedata.process.domain.model;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;
import org.apache.commons.lang3.builder.ToStringBuilder;

import java.io.Serializable;
import java.math.BigDecimal;

/**
 * 공정별 검사항목 데이터 모델 클래스
 * @author SHMT-MES
 * @since 2025.10.24
 * @version 1.0
 * @see
 *
 * <pre>
 * << 개정이력(Modification Information) >>
 *
 *   수정일      수정자           수정내용
 *  -------    --------    ---------------------------
 *   2025.10.24 SHMT-MES          최초 생성
 *
 * </pre>
 */
@Schema(description = "공정별 검사항목 모델")
@Getter
@Setter
public class ProcessInspection implements Serializable {

	/**
	 *  serialVersion UID
	 */
	private static final long serialVersionUID = 1L;

	@Schema(description = "회사 코드")
	private String factoryCode = "000001";

	@Schema(description = "공정 ID")
	private String processId = "";

	@Schema(description = "공정 코드")
	private String processCode = "";

	@Schema(description = "공정 검사항목 ID")
	private String processInspectionId = "";

	@Schema(description = "검사 코드")
	private String inspectionCode = "";

	@Schema(description = "검사항목명")
	private String inspectionName = "";

	@Schema(description = "검사 타입")
	private String inspectionType = "";

	@Schema(description = "기준값")
	private String standardValue = "";

	@Schema(description = "상한값")
	private BigDecimal upperLimit;

	@Schema(description = "하한값")
	private BigDecimal lowerLimit;

	@Schema(description = "단위")
	private String unit = "";

	@Schema(description = "설명")
	private String description = "";

	@Schema(description = "사용 여부 (Y/N)")
	private String useYn = "";

	@Schema(description = "등록자 ID")
	private String regUserId = "";

	@Schema(description = "등록일시")
	private String regDt = "";

	@Schema(description = "수정자 ID")
	private String updUserId = "";

	@Schema(description = "수정일시")
	private String updDt = "";

	/**
	 * toString 메소드를 대치한다.
	 */
	public String toString(){
		return ToStringBuilder.reflectionToString(this);
	}
}
