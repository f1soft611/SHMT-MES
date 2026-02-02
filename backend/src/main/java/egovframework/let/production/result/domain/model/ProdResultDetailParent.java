package egovframework.let.production.result.domain.model;

import java.util.List;

public interface ProdResultDetailParent {
    // 공통 Key
    String getFactoryCode();
    String getProdplanDate();
    Integer getProdplanSeq();
    Integer getProdworkSeq();
    Integer getWorkSeq();
    Integer getProdSeq();
    String getTpr601Id();

    // 작업자
    List<String> getWorkerCodes();

    // 투입자재
//    List<ProdResultMaterialDto> getMaterials();
}
