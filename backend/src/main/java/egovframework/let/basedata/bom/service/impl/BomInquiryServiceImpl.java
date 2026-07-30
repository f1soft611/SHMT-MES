package egovframework.let.basedata.bom.service.impl;

import egovframework.let.basedata.bom.domain.model.BomItemSearchRequestDTO;
import egovframework.let.basedata.bom.domain.model.BomItemSearchRow;
import egovframework.let.basedata.bom.domain.model.BomTreeRow;
import egovframework.let.basedata.bom.domain.repository.BomInquiryDAO;
import egovframework.let.basedata.bom.service.BomInquiryService;
import egovframework.let.common.dto.ListResult;
import lombok.RequiredArgsConstructor;
import org.egovframe.rte.fdl.cmmn.EgovAbstractServiceImpl;
import org.springframework.stereotype.Service;

import java.util.List;

@Service("BomInquiryService")
@RequiredArgsConstructor
public class BomInquiryServiceImpl extends EgovAbstractServiceImpl implements BomInquiryService {

    private final BomInquiryDAO bomInquiryDAO;

    @Override
    public ListResult<BomItemSearchRow> searchItems(BomItemSearchRequestDTO searchVO) throws Exception {
        List<BomItemSearchRow> resultList = bomInquiryDAO.selectBomItems(searchVO);
        int totalCount = bomInquiryDAO.selectBomItemsCnt(searchVO);
        return new ListResult<>(resultList, totalCount);
    }

    @Override
    public List<BomTreeRow> getBomTree(int itemSeq) throws Exception {
        return bomInquiryDAO.selectBomTreeRows(itemSeq);
    }
}
