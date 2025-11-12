package egovframework.let.basedata.equipment.domain.model;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;
import org.apache.commons.lang3.builder.ToStringBuilder;

import java.io.Serializable;

/**
 * 설비 관리를 위한 데이터 모델 클래스
 * @author SHMT-MES
 * @since 2025.11.12
 * @version 1.0
 * @see
 *
 * <pre>
 * << 개정이력(Modification Information) >>
 *
 *   수정일      수정자           수정내용
 *  -------    --------    ---------------------------
 *   2025.11.12 SHMT-MES          최초 생성
 *
 * </pre>
 */
@Schema(description = "설비 모델")
@Getter
@Setter
public class Equipment implements Serializable {

	/**
	 *  serialVersion UID
	 */
	private static final long serialVersionUID = 1L;

	@Schema(description = "회사 코드")
	private String factoryCode = "000001";

	@Schema(description = "설비 ID")
	private String equipmentId = "";

	@Schema(description = "시스템 코드")
	private String equipSysCd = "";

	@Schema(description = "설비 코드")
	private String equipCd = "";

	@Schema(description = "설비 규격")
	private String equipSpec = "";

	@Schema(description = "설비 구조")
	private String equipStruct = "";

	@Schema(description = "사용 여부 (Y/N)")
	private String useFlag = "";

	@Schema(description = "가동 시간")
	private String optime = "";

	@Schema(description = "관리자 코드")
	private String managerCode = "";

	@Schema(description = "부관리자 코드")
	private String manager2Code = "";

	@Schema(description = "작업자 코드")
	private String opmanCode = "";

	@Schema(description = "부작업자 코드")
	private String opman2Code = "";

	@Schema(description = "PLC 주소")
	private String plcAddress = "";

	@Schema(description = "위치")
	private String location = "";

	@Schema(description = "상태 플래그")
	private String statusFlag = "";

	@Schema(description = "가동 시간 2")
	private String optime2 = "";

	@Schema(description = "비고")
	private String remark = "";

	@Schema(description = "설비명")
	private String equipmentName = "";

	@Schema(description = "변경 일자")
	private String changeDate = "";

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
