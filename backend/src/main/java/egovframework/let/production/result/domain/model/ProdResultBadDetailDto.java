package egovframework.let.production.result.domain.model;

import lombok.Data;

@Data
public class ProdResultBadDetailDto {
    // === PK / FK ===
    private String factoryCode;
    private String prodplanDate;
    private Integer prodplanSeq;
    private Integer prodworkSeq;
    private Integer workSeq;
    private Integer prodSeq;

    private Integer badSeq;     // BAD_SEQ (채번 필요)

    private String workCode;

    // === 불량 정보 ===
    private String qcCode;     // QC_CODE
    private Integer qcQty;  // QC_QTY

    private String tpr605Id;
}
