package egovframework.let.basedata.commoncode.domain.model;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

/**
 * MES 공통코드 상세 검색 및 페이징을 위한 VO 클래스
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
@Schema(description = "공통코드 상세 검색 VO")
@Getter
@Setter
public class CommonDetailCodeVO extends CommonDetailCode {

	/**
	 *  serialVersion UID
	 */
	private static final long serialVersionUID = 1L;

	@Schema(description = "검색 조건")
	private String searchCnd = "";

	@Schema(description = "검색 키워드")
	private String searchWrd = "";

	@Schema(description = "페이지 번호")
	private int pageIndex = 1;

	@Schema(description = "페이지당 레코드 수")
	private int pageUnit = 10;

	@Schema(description = "페이지 크기")
	private int pageSize = 10;

	@Schema(description = "첫 번째 레코드 인덱스")
	private int firstIndex = 0;

	@Schema(description = "마지막 레코드 인덱스")
	private int lastIndex = 10;

	@Schema(description = "페이지당 레코드 수")
	private int recordCountPerPage = 10;
}
