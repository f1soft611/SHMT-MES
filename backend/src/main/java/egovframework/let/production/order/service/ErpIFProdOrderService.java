package egovframework.let.production.order.service;

import egovframework.let.production.order.domain.model.ErpIFProdOrderDto;
import egovframework.let.production.order.domain.model.ErpIFProdOrderResultDto;

import java.util.List;

public interface ErpIFProdOrderService {

    // ERP DB 연결 확인용
    void checkErpDbConnection() throws Exception;;
    // MES → ERP 전송 (A / D)
    void sendProdOrderToErp(ErpIFProdOrderDto dto) throws Exception;

    // MES → ERP batch전송 (A / D)
    void sendProdOrderBatchToErp(List<ErpIFProdOrderDto> list) throws Exception;

    // ERP → MES 결과 반영
    void updateProdOrderResult(ErpIFProdOrderResultDto dto) throws Exception;
}
