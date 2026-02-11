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
import java.util.List;

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
    public void sendProdOrderToErp(ErpIFProdOrderDto dto) {
        erpIfDao.insertErpIFProdOrder(dto);
    }

    @Override
    public void sendProdOrderBatchToErp(List<ErpIFProdOrderDto> list) {
        if (list == null || list.isEmpty()) return;
        erpIfDao.insertErpIFProdOrderBatch(list);
    }

    @Override
    public void updateProdOrderResult(ErpIFProdOrderResultDto dto) {
        erpIfDao.updateErpIFProdOrderResult(dto);
    }

}
