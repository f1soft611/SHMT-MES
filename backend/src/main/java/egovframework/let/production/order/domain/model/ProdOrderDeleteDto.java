package egovframework.let.production.order.domain.model;

import lombok.Data;

@Data
public class ProdOrderDeleteDto {

    private String prodorderId; // i/f 연동 위해 필요함

    private String prodplanDate; // yyyyMMdd
    private int prodplanSeq;
    private int prodworkSeq;

    private String opmanCode;
}