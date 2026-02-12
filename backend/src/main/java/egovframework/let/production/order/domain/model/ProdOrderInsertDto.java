package egovframework.let.production.order.domain.model;

import lombok.Data;

@Data
public class ProdOrderInsertDto {

    private String prodplanDate;   // yyyyMMdd
    private int prodplanSeq;
    private int prodworkSeq;
    private int orderSeq;

    private String prodplanId;
    private String prodorderId;
    private int newWorkorderSeq;

    private String workCode;
    private Integer workCodeId;
    private String workdtDate;

    private Integer itemCodeId;
    private Integer itemUnitId;
    private Integer prodCodeId;
    private String equipmentCode;

    private String lotNo;
    private int orderQty;

    private String opmanCode;
    private String bigo;
    private Integer customerCode;
    private Integer tpr110dSeq;
}
