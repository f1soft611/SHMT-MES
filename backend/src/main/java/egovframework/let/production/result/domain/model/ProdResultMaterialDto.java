package egovframework.let.production.result.domain.model;

import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
public class ProdResultMaterialDto extends ProdResultBaseDetailDto {

    private Integer materialSeq;
    private String tpr601mId;

    private String materialCode;
    private BigDecimal inputQty;
}
