package egovframework.let.basedata.processFlow.domain.model;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;
import org.apache.commons.lang3.builder.ToStringBuilder;

import java.io.Serializable;

/**
 * 공정 흐름별 제품 관리를 위한 데이터 모델 클래스
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
 *   2025.11.11 SHMT-MES          최초 생성
 *
 * </pre>
 */
@Schema(description = "공정 흐름별 제품 모델")
@Getter
@Setter
public class ProcessFlowItem implements Serializable {

	/**
	 *  serialVersion UID
	 */
	private static final long serialVersionUID = 1L;

	@Schema(description = "회사 코드")
	private String factoryCode = "000001";

	@Schema(description = "공정 흐름 ID")
	private String processFlowId = "";

	@Schema(description = "공정 흐름 코드")
	private String processFlowCode = "";

	@Schema(description = "제품 ID")
	private String flowItemId = "";

	@Schema(description = "제품 코드 Id")
	private String flowItemCodeId = "";

	@Schema(description = "제품 코드")
	private String flowItemCode = "";

	@Schema(description = "제품 명")
	private String flowItemName = "";

	@Schema(description = "제품 규격")
	private String specification = "";

	@Schema(description = "제품 단위")
	private String unit = "";

	@Schema(description = "제품 단위 이름")
	private String unitName = "";

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
