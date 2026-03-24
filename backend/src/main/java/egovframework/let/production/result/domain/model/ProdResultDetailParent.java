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

    String getWorkCode();

    // 작업자
    List<String> getWorkerCodes();

    // 불량상세
    List<ProdResultBadDetailDto> getBadDetails();

    // 투입자재
//    List<ProdResultMaterialDto> getMaterials();
}
