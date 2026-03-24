package egovframework.let.production.defectrate.domain.model;

import lombok.Data;

import java.io.Serializable;


@Data
public class ProductionDefectRateRow implements Serializable {

	private static final long serialVersionUID = 1L;

	// === PK / FK ===
	private String factoryCode;
	private String prodplanDate;
	private Integer prodplanSeq;
	private Integer prodworkSeq;
	private Integer workSeq;
	private Integer prodSeq;

	// === 수주 정보 ===
	private String orderNo;
	private String customerCode;
	private String customerName;
	private Double orderQty;

	// === 품목 정보 ===
	private String itemCode;
	private String itemName;
	private String itemSpec;

	// === 생산품 정보 ===
	private String prodItemCode;
	private String prodItemName;
	private String prodItemSpec;

	// === 공정 정보 ===
	private String workCode;
	private String workName;

	// === 작업 정보 ===
	private String workDtDate;

	// === 수량 ===
	private Double workQty;     // 작업지시량
	private Double prodQty;     // 생산량
	private Double goodQty;
	private Double badQty;
	private Double qcQty;

	// === 불량 상세 ===
	private Integer badSeq;
	private String qcCode;
	private String qcName;

	// === 계산 컬럼 ===
	private Double remainQty;
	private Double rate;
	private Double defectRate;


	// === 참조 ID ===
	private String tpr601Id;
	private String tpr504Id;

}
