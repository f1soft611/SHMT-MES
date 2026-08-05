package egovframework.let.basedata.bom.domain.model;

import lombok.Data;

@Data
public class BomItemSearchRow {
    private int itemSeq;
    private String itemCode;
    private String itemName;
    private String itemSpec;
}
