package egovframework.let.basedata.equipment.domain.model;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

/**
 * 설비 관리 조회조건을 위한 VO 클래스
 * @author SHMT-MES
 * @since 2025.11.12
 * @version 1.0
 * @see
 *
 * <pre>
 * << 개정이력(Modification Information) >>
 *
 *   수정일      수정자           수정내용
 *  -------    --------    ---------------------------
 *   2025.11.12 SHMT-MES          최초 생성
 *
 * </pre>
 */
@Schema(description = "설비 검색 조건 모델")
@Getter
@Setter
public class EquipmentVO extends Equipment {

	/**
	 *  serialVersion UID
	 */
	private static final long serialVersionUID = 1L;

	@Schema(description = "검색조건 (1:설비코드, 2:설비명, 3:위치)")
	private String searchCnd = "";

	@Schema(description = "검색어")
	private String searchWrd = "";

	@Schema(description = "페이지 번호")
	private int pageIndex = 1;

	@Schema(description = "페이지당 건수")
	private int pageUnit = 10;

	@Schema(description = "페이지 크기")
	private int pageSize = 10;

	@Schema(description = "첫 페이지 인덱스")
	private int firstIndex = 1;

	@Schema(description = "마지막 페이지 인덱스")
	private int lastIndex = 1;

	@Schema(description = "레코드 시작 번호")
	private int recordCountPerPage = 10;
}
