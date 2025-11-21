package egovframework.let.production.plan.domain.model;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;
import org.apache.commons.lang3.builder.ToStringBuilder;

import java.io.Serializable;

/**
 * 생산계획 조회를 위한 VO 클래스
 * @author SHMT-MES
 * @since 2025.11.21
 * @version 1.0
 * @see
 *
 * <pre>
 * << 개정이력(Modification Information) >>
 *
 *   수정일      수정자           수정내용
 *  -------    --------    ---------------------------
 *   2025.11.21 SHMT-MES          최초 생성
 *
 * </pre>
 */
@Schema(description = "생산계획 조회 VO")
@Getter
@Setter
public class ProductionPlanVO extends ProductionPlan implements Serializable {

	/**
	 *  serialVersion UID
	 */
	private static final long serialVersionUID = 1L;

	@Schema(description = "검색 조건")
	private String searchCnd = "";

	@Schema(description = "검색 키워드")
	private String searchWrd = "";

	@Schema(description = "시작일자 (YYYYMMDD)")
	private String startDate = "";

	@Schema(description = "종료일자 (YYYYMMDD)")
	private String endDate = "";

	@Schema(description = "작업장 코드")
	private String workplaceCode = "";

	@Schema(description = "계획상태")
	private String planStatus = "";

	@Schema(description = "페이지 인덱스")
	private int pageIndex = 1;

	@Schema(description = "페이지당 게시물 수")
	private int pageUnit = 10;

	@Schema(description = "페이지 크기")
	private int pageSize = 10;

	@Schema(description = "첫 페이지 인덱스")
	private int firstIndex = 1;

	@Schema(description = "마지막 페이지 인덱스")
	private int lastIndex = 1;

	@Schema(description = "페이지당 레코드 수")
	private int recordCountPerPage = 10;

	/**
	 * toString 메소드를 대치한다.
	 */
	public String toString(){
		return ToStringBuilder.reflectionToString(this);
	}
}
