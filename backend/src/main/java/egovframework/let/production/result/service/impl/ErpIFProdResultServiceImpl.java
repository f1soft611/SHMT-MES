package egovframework.let.production.result.service.impl;

import egovframework.let.erpIf.domain.repository.ErpIFProdResultDAO;
import egovframework.let.production.result.domain.model.ErpIFProdResultDto;
import egovframework.let.production.result.service.ErpIFProdResultService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service("ErpIFProdResultService")
@RequiredArgsConstructor
public class ErpIFProdResultServiceImpl implements ErpIFProdResultService {

    private final ErpIFProdResultDAO erpIfDao;

    @Override
    public boolean sendProdResultToErp(ErpIFProdResultDto dto) {
        try {
            erpIfDao.insertErpIFProdResult(dto);
            return true;
        } catch (Exception e) {
            log.warn("[ERP IF][PROD RESULT] send failed. mesIfKey={}", dto != null ? dto.getMesIfKey() : null, e);
            return false;
        }
    }
}