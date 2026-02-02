package egovframework.let.production.result.domain.model;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class ProdResultWorkerDto extends ProdResultBaseDetailDto {

    private Integer workerSeq;    // WORKER_SEQ
    private String workerCode;    // WORKER_CODE

    private String tpr601wId;     // TPR601WID
}
