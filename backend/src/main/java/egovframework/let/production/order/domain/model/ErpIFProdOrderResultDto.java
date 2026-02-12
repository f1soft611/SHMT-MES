package egovframework.let.production.order.domain.model;

import lombok.Data;


@Data
public class ErpIFProdOrderResultDto {
    private String mesIfKey;

    private String erpProcYn;           // Y / N
    private String erpProcDateTime;     // ERP 처리일시 (ERP에서 받은 값)
    private String status;              // ERP처리상태
    private String result;              // ERP처리결과
}
