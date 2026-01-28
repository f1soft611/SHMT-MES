package egovframework.let.production.order.domain.model;

import lombok.Data;

@Data
public class ProdOrderUpdateDto {

    // WHERE
    private String prodplanDate;   // yyyyMMdd
    private int prodplanSeq;
    private int orderSeq;

    // SET
    private String workdtDate;     // yyyy-MM-dd or yyyyMMdd
    private int orderQty;
    private int newWorkorderSeq;

    private String bigo;
    private String opmanCode;
}
