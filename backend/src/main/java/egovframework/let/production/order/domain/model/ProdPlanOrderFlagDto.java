package egovframework.let.production.order.domain.model;

import lombok.Data;

@Data
public class ProdPlanOrderFlagDto {

    private String prodplanDate; // yyyyMMdd
    private int prodplanSeq;
    private int prodworkSeq;

    private String orderFlag;    // ORDERED / PLAN / ...
}
