package egovframework.let.production.order.service.impl;

import egovframework.let.production.order.domain.model.ErpIFProdOrderDto;
import egovframework.let.production.order.domain.model.ErpIFProdOrderResultDto;
import egovframework.let.erpIf.domain.repository.ErpIFProdOrderDAO;
import egovframework.let.production.order.service.ErpIFProdOrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Slf4j
@Service("ErpIFProdOrderService")
@RequiredArgsConstructor
public class ErpIFProdOrderServiceImpl implements ErpIFProdOrderService {

    private final ErpIFProdOrderDAO erpIfDao;

    @Qualifier("erpDataSource")
    private final DataSource erpDataSource;

    /**
     * ERP DB 연결 정보 확인용 (INSERT 안 함)
     */
    @Override
    public void checkErpDbConnection() throws Exception {

        try (Connection conn = erpDataSource.getConnection()) {

            DatabaseMetaData meta = conn.getMetaData();

            log.info("[ERP IF][DB CHECK] URL      = {}", meta.getURL());
            log.info("[ERP IF][DB CHECK] USERNAME = {}", meta.getUserName());
        }
    }

    @Override
    public boolean sendProdOrderToErp(ErpIFProdOrderDto dto) {
        try {
            erpIfDao.insertErpIFProdOrder(dto);
            return true;
        } catch (Exception e) {
            log.warn("[ERP IF][PROD ORDER][SINGLE] send failed. mesIfKey={}", dto != null ? dto.getMesIfKey() : null, e);
            return false;
        }
    }

    @Override
    public boolean sendProdOrderBatchToErp(List<ErpIFProdOrderDto> list) {
        if (list == null || list.isEmpty()) return true;
        try {
            erpIfDao.insertErpIFProdOrderBatch(list);
            return true;
        } catch (Exception e) {
            log.warn("[ERP IF][PROD ORDER][BATCH] send failed. cnt={}", list.size(), e);
            return false;
        }
    }

    @Override
    public void updateProdOrderResult(ErpIFProdOrderResultDto dto) {
        erpIfDao.updateErpIFProdOrderResult(dto);
    }

    @Override
    public Set<String> selectExistingMesIfKeys(List<String> mesIfKeys) {
        if (mesIfKeys == null || mesIfKeys.isEmpty()) return new HashSet<>();
        try {
            return new HashSet<>(erpIfDao.selectExistingMesIfKeys(mesIfKeys));
        } catch (Exception e) {
            log.warn("[ERP IF][MESIFKEY CHECK] ERP DB 조회 실패, erpIfInserted 전부 false 처리", e);
            return new HashSet<>();
        }
    }

    @Override
    public List<ErpIFProdOrderResultDto> selectErpResultByMesIfKeys(List<String> mesIfKeys) {
        if (mesIfKeys == null || mesIfKeys.isEmpty()) return new java.util.ArrayList<>();
        try {
            return erpIfDao.selectErpResultByMesIfKeys(mesIfKeys);
        } catch (Exception e) {
            log.warn("[ERP IF][RESULT SYNC] ERP DB 결과 조회 실패. keys={}", mesIfKeys.size(), e);
            return new java.util.ArrayList<>();
        }
    }

}
