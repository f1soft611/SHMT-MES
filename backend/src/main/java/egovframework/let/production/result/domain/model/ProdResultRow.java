package egovframework.let.production.result.domain.model;

import lombok.Data;

import java.io.Serializable;

@Data
public class ProdResultRow implements Serializable {

    private static final long serialVersionUID = 1L;

    // === PK / FK ===
    private String factoryCode;
    private String prodplanDate;
    private Integer prodplanSeq;
    private Integer prodworkSeq;
    private Integer workSeq;
    private Integer prodSeq;

    // === 기준 정보 ===
    private String itemCode;
    private String workCode;
    private String orderFlag;

    // === 작업 시간 ===
    private String prodStime;
    private String prodEtime;

    // === 수량 ===
    private Double prodQty;
    private Double goodQty;
    private Double badQty;
    private Double rcvQty;

    // === 지시/연동 ===
    private Integer workorderSeq;
    private String erpSendFlag;
    private Integer erpRsltIdx;

    // === 작업자 / 시간 ===
    private String opmanCode;
    private String optime;
    private String opmanCode2;
    private String optime2;

    // === 참조 ID ===
    private String tpr601Id;
    private String tpr504Id;

    // === 추가 컬럼 (TPR601W 집계) ===
    private String workerCodes;
}
