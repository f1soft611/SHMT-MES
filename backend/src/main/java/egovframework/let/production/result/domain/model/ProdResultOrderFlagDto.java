package egovframework.let.production.result.domain.model;

import lombok.Data;

@Data
public class ProdResultOrderFlagDto {

    private String factoryCode;   // FACTORY_CODE
    private String prodplanDate;  // PRODPLAN_DATE
    private Integer prodplanSeq;  // PRODPLAN_SEQ
    private String orderFlag;     // ORDER_FLAG
}
