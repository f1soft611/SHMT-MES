package egovframework.let.basedata.commoncode.domain.model;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;
import org.apache.commons.lang3.builder.ToStringBuilder;

import java.io.Serializable;

/**
 * MES 공통코드 관리를 위한 데이터 모델 클래스
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
@Schema(description = "공통코드 메인 모델")
@Getter
@Setter
public class CommonCode implements Serializable {

	/**
	 *  serialVersion UID
	 */
	private static final long serialVersionUID = 1L;

	@Schema(description = "코드 ID")
	private String codeId = "";

	@Schema(description = "코드 ID 명")
	private String codeIdNm = "";

	@Schema(description = "코드 ID 설명")
	private String codeIdDc = "";

	@Schema(description = "사용 여부 (Y/N)")
	private String useAt = "";

	@Schema(description = "분류 코드")
	private String clCode = "";

	@Schema(description = "최초 등록 일시")
	private String frstRegistPnttm = "";

	@Schema(description = "최초 등록자 ID")
	private String frstRegisterId = "";

	@Schema(description = "최종 수정 일시")
	private String lastUpdtPnttm = "";

	@Schema(description = "최종 수정자 ID")
	private String lastUpdusrId = "";

	/**
	 * toString 메소드를 대치한다.
	 */
	public String toString(){
		return ToStringBuilder.reflectionToString(this);
	}
}
