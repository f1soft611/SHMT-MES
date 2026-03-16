package egovframework.let.production.defectrate.service.impl;

import egovframework.let.common.dto.ListResult;
import egovframework.let.production.defectrate.domain.model.ProductionDefectRateRow;
import egovframework.let.production.defectrate.domain.model.ProductionDefectRateSearchDto;
import egovframework.let.production.defectrate.domain.repository.ProductionDefectRateDAO;
import egovframework.let.production.defectrate.service.EgovProductionDefectRateService;
import lombok.RequiredArgsConstructor;
import org.egovframe.rte.fdl.cmmn.EgovAbstractServiceImpl;
import org.springframework.stereotype.Service;

import java.util.List;

@Service("egovProductionDefectRateService")
@RequiredArgsConstructor
public class EgovProductionDefectRateServiceImpl extends EgovAbstractServiceImpl implements EgovProductionDefectRateService {
    private final ProductionDefectRateDAO productionDefectRateDAO;

    @Override
    public ListResult<ProductionDefectRateRow> selectProdDefectRateList(ProductionDefectRateSearchDto dto) throws Exception {
        List<ProductionDefectRateRow> list = productionDefectRateDAO.selectProdDefectRateList(dto);
        int resultCnt = productionDefectRateDAO.selectProdDefectRateListCnt(dto);

        return new ListResult<>(list, resultCnt);
    }
}
