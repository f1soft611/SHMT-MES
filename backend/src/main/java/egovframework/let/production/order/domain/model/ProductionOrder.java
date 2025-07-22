package egovframework.let.production.order.domain.model;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;
import org.apache.commons.lang3.builder.ToStringBuilder;

import java.io.Serializable;

/**
 * 생산 지시에 대한 데이터 처리 모델 클래스
 * @author 김기형
 * @since 2025.07.22
 * @version 1.0
 * @see
 *
 * <pre>
 * << 개정이력(Modification Information) >>
 *
 *   수정일      수정자           수정내용
 *  -------    --------    ---------------------------
 *   2025.07.22 김기형          최초 생성
 *
 * </pre>
 */
@Schema(description = "생산지시 모델")
@Getter
@Setter
public class ProductionOrder implements Serializable {

	/**
	 *  serialVersion UID
	 */
	private static final long serialVersionUID = -8868310931851410226L;

	@Schema(description = "고유번호")
	private String id = "";

	@Schema(description = "생산지시번호")
	private String orderNo = "";

	@Schema(description = "품목명")
	private String itemName = "";

	@Schema(description = "생산지시량")
	private String quantity = "";

	@Schema(description = "상태")
	private String status = "";

	@Schema(description = "진행률")
	private String progress = "";

	@Schema(description = "생산지시일")
	private String dueDate = "";

	@Schema(description = "거래처")
	private String customer = "";

	@Schema(description = "생성일")
	private String createdAt = "";

	@Schema(description = "지시자")
	private String operator = "";

	/**
	 * toString 메소드를 대치한다.
	 */
	public String toString(){
		return ToStringBuilder.reflectionToString(this);
	}
}
