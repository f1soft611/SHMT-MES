package egovframework.let.interfacelog.domain.model;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;
import org.apache.commons.lang3.builder.ToStringBuilder;

import java.io.Serializable;

/**
 * 인터페이스 로그 관리를 위한 도메인 모델 클래스
 * @author AI Assistant
 * @since 2025.01.20
 * @version 1.0
 * @see
 *
 * <pre>
 * << 개정이력(Modification Information) >>
 *
 *   수정일      수정자           수정내용
 *  -------    --------    ---------------------------
 *   2025.01.20 AI Assistant     최초 생성
 *
 * </pre>
 */
@Schema(description = "인터페이스 로그")
@Getter
@Setter
public class InterfaceLog implements Serializable {

	/**
	 *  serialVersion UID
	 */
	private static final long serialVersionUID = -7453027581890846031L;

	@Schema(description = "로그 번호")
	private Long logNo = 0L;

	@Schema(description = "인터페이스명")
	private String interfaceName = "";

	@Schema(description = "시작시간")
	private String startTime = "";

	@Schema(description = "종료시간")
	private String endTime = "";

	@Schema(description = "결과상태")
	private String resultStatus = "";

	@Schema(description = "등록일시")
	private String registDate = "";

	@Schema(description = "등록자ID")
	private String registerId = "";

	/**
	 * toString 메소드를 대치한다.
	 */
	@Override
	public String toString() {
		return ToStringBuilder.reflectionToString(this);
	}
}