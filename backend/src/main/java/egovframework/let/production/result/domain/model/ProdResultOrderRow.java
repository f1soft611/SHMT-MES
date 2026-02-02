package egovframework.let.production.result.domain.model;

import lombok.Data;

@Data
public class ProdResultOrderRow {

    private String orderNo;
    private String orderSeqno;
    private String orderHistno;
    private String customerCode;
    private String customerName;

    private String factoryCode;
    private String prodplanId;
    private String prodplanDate;
    private Integer prodplanSeq;
    private Integer prodworkSeq;
    private Integer workSeq;

    private String workdtDate;

    private String workcenterCode;
    private String workcenterName;

    private String workCode;
    private String workName;

    private String itemCode;
    private String itemName;

    private String prodCode;
    private String prodName;
    private String prodSpec;

    private String equipSysCd;
    private String equipSysCdNm;

    private Double prodQty;

    private String orderFlag;
    private Integer workorderSeq;

    private String erpSendFlag;
    private Integer erpWorkdtIdx;

    private String opmanCode;
    private String optime;
    private String opmanCode2;
    private String optime2;

    private String tpr504Id;
    private String prodorderId;
}
