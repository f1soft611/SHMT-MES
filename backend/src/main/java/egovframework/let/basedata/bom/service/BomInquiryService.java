package egovframework.let.basedata.bom.service;

import egovframework.let.basedata.bom.domain.model.BomItemSearchRequestDTO;
import egovframework.let.basedata.bom.domain.model.BomItemSearchRow;
import egovframework.let.basedata.bom.domain.model.BomTreeRow;
import egovframework.let.common.dto.ListResult;

import java.util.List;

public interface BomInquiryService {

    ListResult<BomItemSearchRow> searchItems(BomItemSearchRequestDTO searchVO) throws Exception;

    List<BomTreeRow> getBomTree(int itemSeq) throws Exception;
}
