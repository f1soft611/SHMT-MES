package egovframework.let.basedata.bom.domain.model;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class BomTreeRow {
    private String depth;
    private int itemSeq;
    private String itemCode;
    private String itemName;
    private int procSeq;
    private int matItemSeq;
    private String matItemNo;
    private String matItemName;
    private String matItemSpec;
    private BigDecimal needQtyNumerator;
    private BigDecimal needQtyDenominator;
    private String unitName;
    private int smDelvType;
}
