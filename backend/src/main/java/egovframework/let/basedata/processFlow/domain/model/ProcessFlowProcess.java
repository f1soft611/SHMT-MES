package egovframework.let.basedata.processFlow.domain.model;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;
import org.apache.commons.lang3.builder.ToStringBuilder;

import java.io.Serializable;

/**
 * 공정 흐름별 공정 관리를 위한 데이터 모델 클래스
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
@Schema(description = "공정 흐름별 공정 모델")
@Getter
@Setter
public class ProcessFlowProcess implements Serializable {

	/**
	 *  serialVersion UID
	 */
	private static final long serialVersionUID = 1L;

	@Schema(description = "회사 코드") // FACTORY_CODE
	private String factoryCode = "000001";

	@Schema(description = "공정 흐름 ID") // WORK_ORDER_ID
	private String processFlowId = "";

	@Schema(description = "공정 흐름 코드") // WORK_ORDER
	private String processFlowCode = "";

	@Schema(description = "흐름별 공정 ID") // FLOW_PROCESS_ID
	private String flowProcessId = "";

	@Schema(description = "흐름별 공정 코드") // WORK_CODE
	private String flowProcessCode = "";

	@Schema(description = "흐름별 공정 명") // WORK_CODE_NAME
	private String flowProcessName;

	@Schema(description = "공정 흐름 순번")// SEQ
	private String seq = "";

	@Schema(description = "공정 순서") // WORK_SEQ
	private String processSeq = "";

	@Schema(description = "공정 순서") // EQUIPMENT_FLAG
	private String equipmentFlag = "";

	@Schema(description = "최종 공정") // LAST_FLAG
	private String lastFlag = "";

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
