package egovframework.let.scheduler.domain.model;

import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Date;

/**
 * ERP 생산 의뢰 정보 DTO
 * ERP의 생산의뢰 테이블 구조에 매핑되는 도메인 모델
 * 
 * @author SHMT-MES
 * @since 2025.11.19
 * @version 1.0
 * 
 * <pre>
 * << 개정이력(Modification Information) >>
 *
 *   수정일      수정자           수정내용
 *  -------    --------    ---------------------------
 *   2025.11.19 SHMT-MES          최초 생성
 *
 * </pre>
 */
@Data
public class ErpProductionRequest implements Serializable {
	private static final long serialVersionUID = 1L;

	/**
	 * 공장코드 (FactoryCode)
	 */
	private String factoryCode = "000001";

	/**
	 * 생산의뢰번호 (ProdReqNo) - NVARCHAR(100)
	 */
	private String prodReqNo;

	/**
	 * 생산의뢰코드 (ProdReqSeq) - int
	 */
	private Integer prodReqSeq;

	/**
	 * 생산의뢰순번 (Serl) - int
	 */
	private Integer serl;

	/**
	 * 생산의뢰일 (ReqDate) - nchar(8)
	 */
	private String reqDate;

	/**
	 * 거래처 (CustSeq) - int
	 */
	private Integer custSeq;

	/**
	 * 의뢰부서 (DeptSeq) - int
	 */
	private Integer deptSeq;

	/**
	 * 의뢰자 (EmpSeq) - int
	 */
	private Integer empSeq;

	/**
	 * 품목내부코드 (ItemSeq) - int
	 */
	private Integer itemSeq;

	/**
	 * 품목번호 (ItemNo) - NVARCHAR(100)
	 */
	private String itemNo;

	/**
	 * 품목명 (ItemName) - NVARCHAR(100)
	 */
	private String itemName;

	/**
	 * 품목규격 (Spec) - NVARCHAR(100)
	 */
	private String spec;

	/**
	 * 단위코드 (UnitSeq) - int
	 */
	private Integer unitSeq;

	/**
	 * 의뢰수량 (Qty) - NUMERIC(19,5)
	 */
	private BigDecimal qty;

	/**
	 * 완료요청일 (EndDate) - nchar(8)
	 */
	private String endDate;

	/**
	 * 납기일 (DelvDate) - nchar(8)
	 */
	private String delvDate;

	/**
	 * 최종수정자내부코드 (LastUserSeq) - int
	 */
	private Integer lastUserSeq;

	/**
	 * 최종수정일시 (LastDateTime) - datetime
	 */
	private Date lastDateTime;
}
