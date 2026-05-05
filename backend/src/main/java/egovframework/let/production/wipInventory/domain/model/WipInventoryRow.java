package egovframework.let.production.wipInventory.domain.model;

import lombok.Data;

import java.io.Serializable;

@Data
public class WipInventoryRow implements Serializable {

    private static final long serialVersionUID = 1L;

    // === PK / FK ===
    private String factoryCode;
    private String prodplanDate;
    private Integer prodplanSeq;
    private Integer prodworkSeq;
    private Integer workSeq;

    // === 기준 정보 ===
    private String itemCode;
    private String workCode;
    private String prodCode;

    // === JOIN 조회 필드 ===
    private String lotNo;
    private String workdtDate;
    private String workName;
    private String prodItemCode;
    private String prodItemName;
    private String prodItemSpec;
    private String prodName;
    private Integer wipQty;
    private String processFlow;

    // === 작업자 / 시간 ===
    private String opmanCode;
    private String optime;
    private String opmanCode2;
    private String optime2;
}