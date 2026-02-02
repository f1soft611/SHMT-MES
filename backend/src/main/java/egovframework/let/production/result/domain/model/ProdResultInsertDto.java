package egovframework.let.production.result.domain.model;

import lombok.Data;

import java.util.List;

@Data
public class ProdResultInsertDto implements ProdResultDetailParent {

    // key
    private String factoryCode;   // FACTORY_CODE
    private String prodplanDate;  // PRODPLAN_DATE
    private Integer prodplanSeq;  // PRODPLAN_SEQ
    private Integer prodworkSeq;  // PRODWORK_SEQ
    private Integer workSeq;      // WORK_SEQ
    private Integer prodSeq;      // PROD_SEQ

    private String workdtDate;

    private String prodStime;
    private String prodEtime;

    private Integer prodQty;      // PROD_QTY
    private Integer goodQty;      // GOOD_QTY
    private Integer badQty;       // BAD_QTY
    private Integer rcvQty;       // RCV_QTY

    private Integer workorderSeq;
    private String erpSendFlag;
    private Integer erpRsltIdx;
    private String orderFlag;     // ORDER_FLAG

    private String workCode;      // WORK_CODE
    private String itemCode;

    private String tpr601Id;      // TPR601ID
    private String tpr504Id;      // TPR504ID

    private String opmanCode;
    private String optime;
    private String opmanCode2;
    private String optime2;

    private List<String> workerCodes;
//    private List<String> meterialCodes;
}
