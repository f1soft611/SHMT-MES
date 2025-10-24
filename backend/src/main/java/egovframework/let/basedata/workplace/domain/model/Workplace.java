package egovframework.let.basedata.workplace.domain.model;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;
import org.apache.commons.lang3.builder.ToStringBuilder;

import java.io.Serializable;

/**
 * 작업장 관리를 위한 데이터 모델 클래스
 * @author SHMT-MES
 * @since 2025.10.21
 * @version 1.0
 * @see
 *
 * <pre>
 * << 개정이력(Modification Information) >>
 *
 *   수정일      수정자           수정내용
 *  -------    --------    ---------------------------
 *   2025.10.21 SHMT-MES          최초 생성
 *
 * </pre>
 */
@Schema(description = "작업장 모델")
@Getter
@Setter
public class Workplace implements Serializable {

	/**
	 *  serialVersion UID
	 */
	private static final long serialVersionUID = 1L;

	@Schema(description = "작업장 ID")
	private String workplaceId = "";

	@Schema(description = "작업장 코드")
	private String workplaceCode = "";

	@Schema(description = "작업장명")
	private String workplaceName = "";

	@Schema(description = "작업장 설명")
	private String description = "";

	@Schema(description = "작업장 위치")
	private String location = "";

	@Schema(description = "작업장 타입")
	private String workplaceType = "";

	@Schema(description = "작업장 상태 (ACTIVE/INACTIVE)")
	private String status = "";

	@Schema(description = "사용 여부 (Y/N)")
	private String useYn = "";

	@Schema(description = "등록된 공정 갯수")
	private String proCnt = "";

	@Schema(description = "등록된 작업자수")
	private String workerCnt = "";

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
