package egovframework.let.production.result.domain.model;

import lombok.Data;

import java.util.List;

@Data
public class ProdResultUpdateDto implements ProdResultDetailParent {

    //  key
    private String factoryCode;
    private String prodplanDate;
    private Integer prodplanSeq;
    private Integer prodworkSeq;
    private Integer workSeq;
    private Integer prodSeq;

    private String tpr601Id;

    //  수정 컬럼
    private String prodStime;   // PROD_STIME
    private String prodEtime;   // PROD_ETIME
    private Integer prodQty;    // PROD_QTY
    private Integer goodQty;    // GOOD_QTY
    private Integer badQty;     // BAD_QTY
    private Integer rcvQty;     // RCV_QTY
    private String opmanCode;   // OPMAN_CODE2

    private List<String> workerCodes; // 작업자
//    private List<String> materialCodes; // 투입자재
}
