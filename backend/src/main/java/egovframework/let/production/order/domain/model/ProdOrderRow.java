package egovframework.let.production.order.domain.model;

import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.math.BigDecimal;

/**
 * 생산계획 조회 결과 DTO
 */
@Getter
@Setter
public class ProdOrderRow implements Serializable {

    private static final long serialVersionUID = 1L;

    private String idx;

    private String factoryCode;

    private String prodplanDate;
    private Integer prodplanSeq;
    private Integer prodworkSeq;

    private Integer orderSeq;        // WORK_SEQ
    private String prodplanId;
    private String prodorderId;
    private Integer workorderSeq;

    private String lastFlag;

    private String workCode;
    private String workName;

    private String equipmentCode;
    private String equipmentName;

    private String workdtDate;

    private String itemCodeId;
    private String itemCode;

    private String prodCodeId;
    private String prodCode;

    private String materialName;
    private String materialSpec;
    private String materialUnit;

    private String orderFlag;
    private String lotNo;

    private int orderQty;     // PROD_QTY

    private String bigo;

    private String opmanCode2;
    private String optime2;

    private Integer rstCnt;           // 실적 건수
    private Integer tpr110dSeq;
}