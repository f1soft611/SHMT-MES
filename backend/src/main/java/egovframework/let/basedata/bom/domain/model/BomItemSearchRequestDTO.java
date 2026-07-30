package egovframework.let.basedata.bom.domain.model;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Schema(description = "BOM 조회용 품목 검색 조건 DTO")
public class BomItemSearchRequestDTO {

    @Schema(description = "검색 조건 (1:품목코드, 2:품목명)", example = "1")
    private String searchCnd = "";

    @Schema(description = "검색어", example = "")
    private String searchWrd = "";

    @Schema(description = "페이지 번호", example = "1")
    private int pageIndex = 1;

    @Schema(description = "페이지당 레코드 수", example = "10")
    private int pageUnit = 10;

    @Schema(hidden = true)
    private String factoryCode;

    @Schema(hidden = true)
    private int firstIndex;

    @Schema(hidden = true)
    private int recordCountPerPage;
}
