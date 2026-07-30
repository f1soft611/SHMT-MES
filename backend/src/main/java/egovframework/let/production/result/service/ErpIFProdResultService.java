package egovframework.let.production.result.service;

import egovframework.let.production.result.domain.model.ErpIFProdResultDto;

public interface ErpIFProdResultService {

    // MES → ERP 전송 (A / D). 실패해도 예외를 던지지 않고 false를 반환한다.
    boolean sendProdResultToErp(ErpIFProdResultDto dto);
}