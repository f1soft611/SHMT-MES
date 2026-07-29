package egovframework.let.basedata.bom.domain.repository;

import egovframework.let.basedata.bom.domain.model.BomItemSearchRow;
import egovframework.let.basedata.bom.domain.model.BomTreeRow;
import org.egovframe.rte.psl.dataaccess.EgovAbstractMapper;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository("BomInquiryDAO")
public class BomInquiryDAO extends EgovAbstractMapper {

    public List<BomItemSearchRow> selectBomItems(Map<String, Object> params) throws Exception {
        return selectList("BomInquiryDAO.selectBomItems", params);
    }

    public List<BomTreeRow> selectBomTreeRows(int itemSeq) throws Exception {
        return selectList("BomInquiryDAO.selectBomTreeRows", itemSeq);
    }
}
