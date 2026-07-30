package egovframework.let.basedata.bom.domain.repository;

import egovframework.let.basedata.bom.domain.model.BomItemSearchRequestDTO;
import egovframework.let.basedata.bom.domain.model.BomItemSearchRow;
import egovframework.let.basedata.bom.domain.model.BomTreeRow;
import org.egovframe.rte.psl.dataaccess.EgovAbstractMapper;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository("BomInquiryDAO")
public class BomInquiryDAO extends EgovAbstractMapper {

    public List<BomItemSearchRow> selectBomItems(BomItemSearchRequestDTO searchVO) throws Exception {
        return selectList("BomInquiryDAO.selectBomItems", searchVO);
    }

    public int selectBomItemsCnt(BomItemSearchRequestDTO searchVO) throws Exception {
        return (Integer) selectOne("BomInquiryDAO.selectBomItemsCnt", searchVO);
    }

    public List<BomTreeRow> selectBomTreeRows(int itemSeq) throws Exception {
        return selectList("BomInquiryDAO.selectBomTreeRows", itemSeq);
    }
}
