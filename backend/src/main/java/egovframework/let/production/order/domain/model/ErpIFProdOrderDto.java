package egovframework.let.production.order.domain.model;

import lombok.Data;

@Data
public class ErpIFProdOrderDto {

    private String workingTag;        // A:신규 / D:삭제
    private String regEmpId;           // 등록자

    // RegDateTime → GETDATE()
    // ERPProcYn   → N''
    // ERPProcDateTime → NULL
    // Status → NULL
    // Result → NULL

    private String mesIfKey;            // 연동키

    private Integer workOrderSeq;       // 신규 A : 0 / 삭제 D : 0이 아닌 값
    private Integer workOrderSerl;      // 신규 A : 0 / 삭제 D : 0이 아닌 값

    private Integer factUnit;           // default 1

    private String workOrderNo;
    private String workOrderDate;       // YYYYMMDD

    private Integer prodPlanSeq;
    private Integer workCenterSeq;
    private Integer goodItemSeq;
    private Integer procSeq;
    private Integer prodUnitSeq;

    private Integer orderQty;           // Integer? BigDecimal?

    private Integer deptSeq;
    private Integer empSeq;
    private String procRev;
    private String remark;
}