package egovframework.let.production.performance.service;

import egovframework.let.common.dto.ListResult;
import egovframework.let.production.performance.domain.model.ProductionPerformanceRow;
import egovframework.let.production.performance.domain.model.ProductionPerformanceSearchDto;


public interface EgovProductionPerformanceService {
    ListResult<ProductionPerformanceRow> selectProdPerfRowList(ProductionPerformanceSearchDto searchDto) throws Exception;
}
