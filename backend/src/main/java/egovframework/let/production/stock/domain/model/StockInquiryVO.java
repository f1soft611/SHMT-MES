package egovframework.let.production.stock.domain.model;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

/**
 * 재고조회 검색 조건 VO
 * @author SHMT-MES
 * @since 2026.02.13
 * @version 1.0
 * @see
 *
 * <pre>
 * << 개정이력(Modification Information) >>
 *
 *   수정일      수정자           수정내용
 *  -------    --------    ---------------------------
 *   2026.02.13 SHMT-MES          최초 생성
 *
 * </pre>
 */
@Schema(description = "재고조회 검색 조건")
@Getter
@Setter
public class StockInquiryVO implements Serializable {

	private static final long serialVersionUID = 1L;

	@Schema(description = "회사 코드")
	private String factoryCode = "000001";

	@Schema(description = "조회일자From (YYYYMMDD)")
	private String dateFr = "";

	@Schema(description = "조회일자To (YYYYMMDD)")
	private String dateTo = "";

	@Schema(description = "품번")
	private String itemNo = "";

	@Schema(description = "품명")
	private String itemName = "";

	@Schema(description = "창고명")
	private String whName = "";

	@Schema(description = "페이지 번호")
	private int pageIndex = 1;

	@Schema(description = "페이지당 게시물 수")
	private int pageSize = 10;

	@Schema(description = "정렬 컬럼")
	private String sortColumn = "";

	@Schema(description = "정렬 방향 (ASC/DESC)")
	private String sortOrder = "ASC";
}
