package egovframework.let.production.result.domain.model;

import lombok.Data;

@Data
public class ErpIFProdResultDto {

    private String workingTag;   // A:신규 / D:삭제(취소)
    private String regEmpId;     // 등록자, 없으면 SYSTEM

    // RegDateTime → GETDATE()
    // ERPProcYn   → 'N'
    // ERPProcDateTime / Status / Result → NULL (ERP가 이후 채움, 이번 범위에서는 조회하지 않음)

    private String mesIfKey;     // TPR601ID

    private String workDate;         // PRODPLAN_DATE (YYYYMMDD)
    private Integer workOrderSeq;    // TPR504.WORKORDER_SEQ
    private Integer workOrderSerl;   // TPR504.WORKORDER_SEQ (생산지시와 동일하게 Seq/Serl에 같은 값 사용)
    private String workOrderNo;      // TPR504.LOT_NO
    private String lotNo;            // TPR504.LOT_NO

    private Integer deptSeq;      // 미확정, 0 고정
    private Integer empSeq;       // 미확정, 0 고정
    private Integer workCenterSeq; // 미확정, 1 고정
    private Integer itemSeq;      // TPR601.ITEM_CODE를 정수로 변환한 값(실패 시 0)
    private Integer unitSeq;      // 미확정, 0 고정

    private Integer prodQty;
    private Integer okQty;
    private Integer badQty;

    private String workStartTime; // HHmm (PROD_STIME "yyyy-MM-dd HH:mm"에서 변환)
    private String workEndTime;   // HHmm (PROD_ETIME "yyyy-MM-dd HH:mm"에서 변환)

    private Integer workerQty;    // 작업자 수
}