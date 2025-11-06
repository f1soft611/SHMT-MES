package egovframework.let.basedata.process.domain.model;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

/**
 * 공정별 중지항목 검색 VO 클래스
 * @author SHMT-MES
 * @since 2025.11.06
 * @version 1.0
 * @see
 *
 * <pre>
 * << 개정이력(Modification Information) >>
 *
 *   수정일      수정자           수정내용
 *  -------    --------    ---------------------------
 *   2025.11.06 SHMT-MES          최초 생성
 *
 * </pre>
 */
@Schema(description = "공정별 중지항목 검색 VO")
@Getter
@Setter
public class ProcessStopItemVO extends ProcessStopItem {

	/**
	 *  serialVersion UID
	 */
	private static final long serialVersionUID = 1L;

	@Schema(description = "검색 조건")
	private String searchCondition = "";

	@Schema(description = "검색 키워드")
	private String searchKeyword = "";
}
