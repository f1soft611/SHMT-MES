package egovframework.let.production.order.service;

import egovframework.let.production.order.domain.model.ErpIFProdOrderDto;
import egovframework.let.production.order.domain.model.ErpIFProdOrderResultDto;

import java.util.List;
import java.util.Set;

public interface ErpIFProdOrderService {

    // ERP DB 연결 확인용
    void checkErpDbConnection() throws Exception;;
    // MES → ERP 전송 (A / D)
    boolean sendProdOrderToErp(ErpIFProdOrderDto dto) throws Exception;

    // MES → ERP batch전송 (A / D)
    boolean sendProdOrderBatchToErp(List<ErpIFProdOrderDto> list) throws Exception;

    // ERP → MES 결과 반영
    void updateProdOrderResult(ErpIFProdOrderResultDto dto) throws Exception;

    // ERP IF 테이블에서 존재하는 MESIFKey를 Set으로 반환
    Set<String> selectExistingMesIfKeys(List<String> mesIfKeys);
}
