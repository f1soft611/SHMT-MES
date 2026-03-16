package egovframework.let.production.defectrate.service;

import egovframework.let.common.dto.ListResult;
import egovframework.let.production.defectrate.domain.model.ProductionDefectRateRow;
import egovframework.let.production.defectrate.domain.model.ProductionDefectRateSearchDto;


public interface EgovProductionDefectRateService {
    ListResult<ProductionDefectRateRow> selectProdDefectRateList(ProductionDefectRateSearchDto searchDto) throws Exception;
}
