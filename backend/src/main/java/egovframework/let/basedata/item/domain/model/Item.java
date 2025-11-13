package egovframework.let.basedata.item.domain.model;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;
import org.apache.commons.lang3.builder.ToStringBuilder;

import java.io.Serializable;

/**
 * 품목 관리를 위한 데이터 모델 클래스
 * @author SHMT-MES
 * @since 2025.10.24
 * @version 1.0
 * @see
 *
 * <pre>
 * << 개정이력(Modification Information) >>
 *
 *   수정일      수정자           수정내용
 *  -------    --------    ---------------------------
 *   2025.10.24 SHMT-MES          최초 생성
 *
 * </pre>
 */
@Schema(description = "품목 모델")
@Getter
@Setter
public class Item implements Serializable {

	/**
	 *  serialVersion UID
	 */
	private static final long serialVersionUID = 1L;

	@Schema(description = "회사 코드")
	private String factoryCode = "000001";

	@Schema(description = "품목 ID")
	private String itemId = "";

	@Schema(description = "품목 코드")
	private String itemCode = "";

	@Schema(description = "품목명")
	private String itemName = "";

	@Schema(description = "품목 타입 (PRODUCT/MATERIAL)")
	private String itemType = "";

	@Schema(description = "규격")
	private String specification = "";

	@Schema(description = "단위")
	private String unit = "";

	@Schema(description = "재고 수량")
	private String stockQty = "";

	@Schema(description = "안전 재고")
	private String safetyStock = "";

	@Schema(description = "비고")
	private String remark = "";

	@Schema(description = "인터페이스 여부 (Y/N)")
	private String interfaceYn = "";

	@Schema(description = "사용 여부 (Y/N)")
	private String useYn = "";

	@Schema(description = "등록자 ID")
	private String regUserId = "";

	@Schema(description = "등록일시")
	private String regDt = "";

	@Schema(description = "수정자 ID")
	private String updUserId = "";

	@Schema(description = "수정일시")
	private String updDt = "";

	/**
	 * toString 메소드를 대치한다.
	 */
	public String toString(){
		return ToStringBuilder.reflectionToString(this);
	}
}
