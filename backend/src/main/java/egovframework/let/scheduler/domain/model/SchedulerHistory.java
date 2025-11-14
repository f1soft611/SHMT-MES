package egovframework.let.scheduler.domain.model;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;
import org.apache.commons.lang3.builder.ToStringBuilder;

import java.io.PrintWriter;
import java.io.Serializable;
import java.io.StringWriter;

/**
 * 스케쥴러 실행 이력 모델
 * @author SHMT-MES
 * @since 2025.10.23
 * @version 1.0
 * @see
 *
 * <pre>
 * << 개정이력(Modification Information) >>
 *
 *   수정일      수정자           수정내용
 *  -------    --------    ---------------------------
 *   2025.10.23 SHMT-MES          최초 생성
 *
 * </pre>
 */
@Schema(description = "스케쥴러 실행 이력 모델")
@Getter
@Setter
public class SchedulerHistory implements Serializable {

	/**
	 *  serialVersion UID
	 */
	private static final long serialVersionUID = 1L;

	@Schema(description = "이력 ID")
	private Long historyId = null;

	@Schema(description = "스케쥴러 ID")
	private Long schedulerId = null;

	@Schema(description = "스케쥴러 명")
	private String schedulerName = "";

	@Schema(description = "시작시간")
	private String startTime = "";

	@Schema(description = "종료시간")
	private String endTime = "";

	@Schema(description = "실행상태 (SUCCESS/FAILED/RUNNING)")
	private String status = "";

	@Schema(description = "에러 메시지")
	private String errorMessage = "";

	// ✨ 추가: 상세 에러 정보
	@Schema(description = "에러 스택트레이스")
	private String errorStackTrace = "";

	@Schema(description = "실행시간(밀리초)")
	private Long executionTimeMs = null;

	@Schema(description = "등록일시")
	private String regDt = "";

	// ✨ 추가: 재시도 횟수
	@Schema(description = "재시도 횟수")
	private Integer retryCount = 0;

	/**
	 * Exception을 기반으로 에러 정보를 설정
	 */
	public void setErrorFromException(Exception e) {
		this.errorMessage = e.getMessage();

		// 스택트레이스를 문자열로 변환 (최대 4000자)
		StringWriter sw = new StringWriter();
		PrintWriter pw = new PrintWriter(sw);
		e.printStackTrace(pw);
		String stackTrace = sw.toString();

		// DB 컬럼 크기 제한 고려
		if (stackTrace.length() > 4000) {
			this.errorStackTrace = stackTrace.substring(0, 4000);
		} else {
			this.errorStackTrace = stackTrace;
		}
	}

	/**
	 * toString 메소드를 대치한다.
	 */
	public String toString(){
		return ToStringBuilder.reflectionToString(this);
	}
}
