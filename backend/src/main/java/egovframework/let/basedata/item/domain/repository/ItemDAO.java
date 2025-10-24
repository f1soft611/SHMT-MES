package egovframework.let.basedata.item.domain.repository;

import egovframework.let.basedata.item.domain.model.Item;
import egovframework.let.basedata.item.domain.model.ItemVO;
import org.egovframe.rte.psl.dataaccess.EgovAbstractMapper;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

/**
 * 품목 관리를 위한 데이터 접근 클래스
 * @author SHMT-MES
 * @since 2025.10.24
 * @version 1.0
 * @see
 *
 * <pre>
 * << 개정이력(Modification Information) >>
 *
 *   수정일      수정자           수정내용
 *  -------    --------    ---------------------------
 *   2025.10.24 SHMT-MES          최초 생성
 *
 * </pre>
 */
@Repository("ItemDAO")
public class ItemDAO extends EgovAbstractMapper {

    /**
     * 품목 목록을 조회한다.
     *
     * @param itemVO
     * @return
     * @throws Exception
     */
    public List<ItemVO> selectItemList(ItemVO itemVO) throws Exception {
		return selectList("ItemDAO.selectItemList", itemVO);
	}

    /**
     * 품목 목록 전체 건수를 조회한다.
     *
     * @param itemVO
     * @return
     * @throws Exception
     */
    public int selectItemListCnt(ItemVO itemVO) throws Exception {
        return (Integer)selectOne("ItemDAO.selectItemListCnt", itemVO);
    }

    /**
     * 품목 상세 정보를 조회한다.
     *
     * @param itemId
     * @return
     * @throws Exception
     */
    public Item selectItem(String itemId) throws Exception {
        return selectOne("ItemDAO.selectItem", itemId);
    }

    /**
     * 품목을 등록한다.
     *
     * @param item
     * @throws Exception
     */
    public void insertItem(Item item) throws Exception {
        insert("ItemDAO.insertItem", item);
    }

    /**
     * 품목을 수정한다.
     *
     * @param item
     * @throws Exception
     */
    public void updateItem(Item item) throws Exception {
        update("ItemDAO.updateItem", item);
    }

    /**
     * 품목을 삭제한다.
     *
     * @param itemId
     * @throws Exception
     */
    public void deleteItem(String itemId) throws Exception {
        delete("ItemDAO.deleteItem", itemId);
    }

    /**
     * 품목 코드 중복 체크
     */
    public int selectItemCodeCheck(String itemCode) {
        return selectOne("ItemDAO.selectItemCodeCheck", itemCode);
    }

    /**
     * 품목 코드 중복 체크 (수정 시)
     */
    public int selectItemCodeCheckForUpdate(Map<String, String> params) {
        return selectOne("ItemDAO.selectItemCodeCheckForUpdate", params);
    }
}
