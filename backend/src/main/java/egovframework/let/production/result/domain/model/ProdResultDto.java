package egovframework.let.production.result.domain.model;

import lombok.Data;

@Data
public class ProdResultDto {

    private String factoryCode;   // FACTORY_CODE
    private String prodplanDate;  // PRODPLAN_DATE
    private Integer prodplanSeq;  // PRODPLAN_SEQ
    private Integer prodworkSeq;  // PRODWORK_SEQ
    private Integer workSeq;      // WORK_SEQ
    private Integer prodSeq;      // PROD_SEQ
}
