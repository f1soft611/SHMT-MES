package egovframework.let.production.performance.service.impl;

import egovframework.let.common.dto.ListResult;
import egovframework.let.production.performance.domain.model.ProductionPerformanceRow;
import egovframework.let.production.performance.domain.model.ProductionPerformanceSearchDto;
import egovframework.let.production.performance.domain.repository.ProductionPerformanceDAO;
import egovframework.let.production.performance.service.EgovProductionPerformanceService;

import lombok.RequiredArgsConstructor;
import org.egovframe.rte.fdl.cmmn.EgovAbstractServiceImpl;
import org.springframework.stereotype.Service;

import java.util.List;

@Service("egovProductionPerformanceService")
@RequiredArgsConstructor
public class EgovProductionPerformanceServiceImpl  extends EgovAbstractServiceImpl implements EgovProductionPerformanceService {
    private final ProductionPerformanceDAO productionPerformanceDAO;

    @Override
    public ListResult<ProductionPerformanceRow> selectProdPerfRowList(ProductionPerformanceSearchDto dto) throws Exception {
        List<ProductionPerformanceRow> list = productionPerformanceDAO.selectProdPerfList(dto);
        int resultCnt = productionPerformanceDAO.selectProdPerfListCnt(dto);

        return new ListResult<>(list, resultCnt);
    }
}
