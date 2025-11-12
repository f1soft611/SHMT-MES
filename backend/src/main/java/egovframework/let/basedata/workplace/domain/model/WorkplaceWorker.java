package egovframework.let.basedata.workplace.domain.model;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;
import org.apache.commons.lang3.builder.ToStringBuilder;

import java.io.Serializable;

/**
 * 작업장별 작업자 관리를 위한 데이터 모델 클래스
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
@Schema(description = "작업장 작업자 모델")
@Getter
@Setter
public class WorkplaceWorker implements Serializable {

	/**
	 *  serialVersion UID
	 */
	private static final long serialVersionUID = 1L;

	@Schema(description = "회사 코드")
	private String factoryCode = "000001";

	@Schema(description = "작업장 ID")
	private String workplaceId = "";

	@Schema(description = "작업장 코드")
	private String workplaceCode = "";

	@Schema(description = "작업자 ID")
	private String workerId = "";

	@Schema(description = "작업자 Code")
	private String workerCode = "";

	@Schema(description = "작업자명")
	private String workerName = "";

	@Schema(description = "직책")
	private String position = "";

	@Schema(description = "역할 (LEADER/MEMBER)")
	private String role = "";

	@Schema(description = "사용 여부 (Y/N)")
	private String useYn = "Y";

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
