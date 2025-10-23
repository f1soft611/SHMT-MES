package egovframework.let.scheduler.model;

import egovframework.com.cmm.ComDefaultVO;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

/**
 * 스케쥴러 설정 검색 VO
 * @author AI Assistant
 * @since 2025.10.23
 * @version 1.0
 */
@Schema(description = "스케쥴러 설정 검색 VO")
@Getter
@Setter
public class SchedulerConfigVO extends ComDefaultVO {

    private static final long serialVersionUID = 1L;

    @Schema(description = "스케쥴러 ID")
    private Long schedulerId;

    @Schema(description = "스케쥴러 명")
    private String schedulerName;

    @Schema(description = "스케쥴러 설명")
    private String schedulerDescription;

    @Schema(description = "CRON 표현식")
    private String cronExpression;

    @Schema(description = "작업 클래스명")
    private String jobClassName;

    @Schema(description = "활성화 여부 (Y/N)")
    private String isEnabled;

    @Schema(description = "등록일시")
    private String createdDate;

    @Schema(description = "등록자")
    private String createdBy;

    @Schema(description = "수정일시")
    private String updatedDate;

    @Schema(description = "수정자")
    private String updatedBy;
}
