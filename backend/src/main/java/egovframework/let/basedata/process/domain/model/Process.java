package egovframework.let.basedata.process.domain.model;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;
import org.apache.commons.lang3.builder.ToStringBuilder;

import java.io.Serializable;

/**
 * 공정 관리를 위한 데이터 모델 클래스
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
@Schema(description = "공정 모델")
@Getter
@Setter
public class Process implements Serializable {

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

	@Schema(description = "공정명")
	private String processName = "";

	@Schema(description = "공정 설명")
	private String description = "";

	@Schema(description = "공정 타입")
	private String processType = "";

	@Schema(description = "설비연동공정 여부 (Y/N)")
	private String equipmentIntegrationYn = "";

	@Schema(description = "공정 상태 (ACTIVE/INACTIVE)")
	private String status = "";

	@Schema(description = "사용 여부 (Y/N)")
	private String useYn = "";

	@Schema(description = "정렬 순서")
	private Integer sortOrder;

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
