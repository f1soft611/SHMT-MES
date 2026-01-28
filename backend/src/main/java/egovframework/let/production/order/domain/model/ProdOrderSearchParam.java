package egovframework.let.production.order.domain.model;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProdOrderSearchParam {

    private String factoryCode;     // FACTORY_CODE (필요 시)
    private String prodplanDate;     // PRODPLAN_DATE (yyyyMMdd)
    private Integer prodplanSeq;     // PRODPLAN_SEQ
    private Integer prodworkSeq;     // PRODWORK_SEQ

}
