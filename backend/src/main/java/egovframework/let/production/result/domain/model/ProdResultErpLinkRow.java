package egovframework.let.production.result.domain.model;

import lombok.Data;

@Data
public class ProdResultErpLinkRow {

    private String tpr601Id;
    private String itemCode;
    private String prodplanDate;

    private Integer prodQty;
    private Integer goodQty;
    private Integer badQty;

    private String prodStime;  // "yyyy-MM-dd HH:mm"
    private String prodEtime;

    private String lotNo;          // TPR504.LOT_NO (조인)
    private Integer workorderSeq;  // TPR504.WORKORDER_SEQ (조인)
}