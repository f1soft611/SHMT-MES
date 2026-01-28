package egovframework.let.production.order.domain.model;

import lombok.Data;

@Data
public class ProdOrderDeleteDto {

    private String prodplanDate; // yyyyMMdd
    private int prodplanSeq;
    private int prodworkSeq;
}