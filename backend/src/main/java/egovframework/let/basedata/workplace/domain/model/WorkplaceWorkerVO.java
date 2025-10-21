package egovframework.let.basedata.workplace.domain.model;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

/**
 * 작업장별 작업자 관리를 위한 VO 클래스
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
@Schema(description = "작업장 작업자 검색 조건 VO")
@Getter
@Setter
public class WorkplaceWorkerVO extends WorkplaceWorker {
	
	/**
	 *  serialVersion UID
	 */
	private static final long serialVersionUID = 1L;

	/** 페이지 번호 */
	@Schema(description = "페이지 번호")
	private int pageIndex = 1;
	
	/** 페이지 갯수 */
	@Schema(description = "페이지당 레코드 수")
	private int pageUnit = 10;
	
	/** 페이지 사이즈 */
	@Schema(description = "페이지 사이즈")
	private int pageSize = 10;

	/** 첫페이지 인덱스 */
	@Schema(description = "첫 페이지 인덱스")
	private int firstIndex = 1;

	/** 마지막페이지 인덱스 */
	@Schema(description = "마지막 페이지 인덱스")
	private int lastIndex = 1;

	/** 페이지당 레코드 개수 */
	@Schema(description = "레코드 개수")
	private int recordCountPerPage = 10;
}
