package egovframework.let.basedata.bom.service;

import egovframework.let.basedata.bom.domain.model.BomItemSearchRow;
import egovframework.let.basedata.bom.domain.model.BomTreeNode;

import java.util.List;
import java.util.Map;

public interface BomInquiryService {

    List<BomItemSearchRow> searchItems(Map<String, Object> params) throws Exception;

    List<BomTreeNode> getBomTree(int itemSeq) throws Exception;
}
