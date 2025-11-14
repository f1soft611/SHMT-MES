package egovframework.let.basedata.processFlow.domain.model;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

/**
 * 공정 흐름별 제품 관리를 위한 VO 클래스
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
@Schema(description = "공정 흐름별 제품 검색 조건 VO")
@Getter
@Setter
public class ProcessFlowItemVO extends ProcessFlowItem {
	
	/**
	 *  serialVersion UID
	 */
	private static final long serialVersionUID = 1L;

	/** 공정 흐름 코드 */
	@Schema(description = "공정 흐름 코드")
	private String searchCnd = "";
	

}
