package egovframework.com.scheduler.model;

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

    @Schema(description = "이력 고유번호")
    private Long id;

    @Schema(description = "인터페이스 작업명")
    private String jobName = "";

    @Schema(description = "작업 시작시간")
    private String startTime = "";

    @Schema(description = "작업 종료시간")
    private String endTime = "";

    @Schema(description = "작업 상태 (SUCCESS, FAIL)")
    private String status = "";

    @Schema(description = "에러 메시지")
    private String errorMessage = "";

    @Schema(description = "생성일시")
    private String createdAt = "";

    // [추가] 검색 조건, 페이징 등을 위한 필드
    @Schema(description = "검색 시작일")
    private String searchStartDate = "";
    @Schema(description = "검색 종료일")
    private String searchEndDate = "";

    @Schema(description = "페이지 번호")
    private int pageIndex = 1;
    @Schema(description = "페이지 크기")
    private int pageSize = 10;

    @Override
    public String toString(){
        return ToStringBuilder.reflectionToString(this);
    }
}
