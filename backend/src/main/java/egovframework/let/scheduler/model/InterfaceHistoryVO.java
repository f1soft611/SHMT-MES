package egovframework.let.scheduler.model;

/**
 * 인터페이스 이력 조회/검색용 VO 클래스
 * @author 김기형
 * @since 2025.08.05
 * @version 1.0
 * @see
 *
 * <pre>
 * << 개정이력(Modification Information) >>
 *
 *   수정일      수정자           수정내용
 *  -------    --------    ---------------------------
 *   2025.08.05 김기형          최초 생성
 *
 * </pre>
 */

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;
import org.apache.commons.lang3.builder.ToStringBuilder;

import java.io.Serializable;

@Schema(description = "인터페이스 이력 조회용 VO")
@Getter
@Setter
public class InterfaceHistoryVO implements Serializable {

    private static final long serialVersionUID = 1L;

    @Schema(description = "검색시작일")
    private String searchBgnDe = "";

    @Schema(description = "검색조건")
    private String searchCnd = "";

    @Schema(description = "검색종료일")
    private String searchEndDe = "";

    @Schema(description = "검색단어")
    private String searchWrd = "";

    @Schema(description = "정렬순서(DESC,ASC)")
    private long sortOrdr = 0L;

    @Schema(description = "검색사용여부")
    private String searchUseYn = "";

    @Schema(description = "현재페이지")
    private int pageIndex = 1;

    @Schema(description = "페이지갯수")
    private int pageUnit = 10;

    @Schema(description = "페이지사이즈")
    private int pageSize = 10;

    @Schema(description = "첫페이지 인덱스")
    private int firstIndex = 1;

    @Schema(description = "마지막페이지 인덱스")
    private int lastIndex = 1;

    @Schema(description = "페이지당 레코드 개수")
    private int recordCountPerPage = 10;

    @Schema(description = "레코드 번호")
    private int rowNo = 0;

    @Override
    public String toString(){
        return ToStringBuilder.reflectionToString(this);
    }
}
