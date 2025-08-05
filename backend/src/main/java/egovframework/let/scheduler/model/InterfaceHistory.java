package egovframework.let.scheduler.model;

/**
 * 인터페이스 이력에 대한 데이터 처리 모델 클래스
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

@Schema(description = "인터페이스 이력 모델")
@Getter
@Setter
public class InterfaceHistory implements Serializable {

    private static final long serialVersionUID = 1L;

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

    @Schema(description = "에러 메시지")
    private String errorMessage = "";

    @Schema(description = "등록일시")
    private String registDate = "";

    @Schema(description = "등록자ID")
    private String registerId = "";

    @Override
    public String toString(){
        return ToStringBuilder.reflectionToString(this);
    }
}