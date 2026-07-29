package egovframework.let.basedata.bom.domain.model;

import lombok.Data;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
public class BomTreeNode {
    private String key;
    private String nodeType; // "PROCESS" | "MATERIAL"
    private Integer itemSeq;
    private String label;
    private String itemNo;
    private String itemSpec;
    private Integer procSeq;
    private BigDecimal needQty;
    private String unitName;
    private List<BomTreeNode> children = new ArrayList<>();
}
