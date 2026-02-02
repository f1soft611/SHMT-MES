package egovframework.let.production.result.domain.model;

import lombok.Data;

@Data
public class ProdResultDeleteDto {

    private String factoryCode;
    private String prodplanDate;
    private Integer prodplanSeq;
    private Integer prodworkSeq;
    private Integer workSeq;
    private Integer prodSeq;

    private String tpr601Id;
}