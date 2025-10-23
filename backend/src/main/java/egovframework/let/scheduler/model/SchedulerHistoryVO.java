package egovframework.let.scheduler.model;

import egovframework.com.cmm.ComDefaultVO;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

/**
 * 스케쥴러 실행 이력 검색 VO
 * @author AI Assistant
 * @since 2025.10.23
 * @version 1.0
 */
@Schema(description = "스케쥴러 실행 이력 검색 VO")
@Getter
@Setter
public class SchedulerHistoryVO extends ComDefaultVO {

    private static final long serialVersionUID = 1L;

    @Schema(description = "이력 ID")
    private Long historyId;

    @Schema(description = "스케쥴러 ID")
    private Long schedulerId;

    @Schema(description = "스케쥴러 명")
    private String schedulerName;

    @Schema(description = "시작시간")
    private String startTime;

    @Schema(description = "종료시간")
    private String endTime;

    @Schema(description = "실행상태 (SUCCESS/FAILED/RUNNING)")
    private String status;

    @Schema(description = "에러 메시지")
    private String errorMessage;

    @Schema(description = "실행시간(밀리초)")
    private Long executionTimeMs;

    @Schema(description = "등록일시")
    private String createdDate;
}
