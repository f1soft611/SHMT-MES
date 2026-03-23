package egovframework.let.production.order.domain.model;

import lombok.Data;

@Data
public class ProdPlanLotNoDto {

    private String prodplanDate; // yyyyMMdd
    private int prodplanSeq;
    private int prodworkSeq;

    private String lotNo;    //
}
