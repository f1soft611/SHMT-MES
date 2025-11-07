package egovframework.let.basedata.process.domain.repository;

import egovframework.let.basedata.process.domain.model.ProcessStopItem;
import egovframework.let.basedata.process.domain.model.ProcessStopItemVO;
import org.egovframe.rte.psl.dataaccess.EgovAbstractMapper;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 공정별 중지항목을 위한 데이터 접근 클래스
 * @author SHMT-MES
 * @since 2025.11.06
 * @version 1.0
 * @see
 *
 * <pre>
 * << 개정이력(Modification Information) >>
 *
 *   수정일      수정자           수정내용
 *  -------    --------    ---------------------------
 *   2025.11.06 SHMT-MES          최초 생성
 *
 * </pre>
 */
@Repository("ProcessStopItemDAO")
public class ProcessStopItemDAO extends EgovAbstractMapper {

    /**
     * 공정별 중지항목 목록을 조회한다.
     *
     * @param processStopItemVO
     * @return
     * @throws Exception
     */
    public List<ProcessStopItemVO> selectProcessStopItemList(ProcessStopItemVO processStopItemVO) throws Exception {
        return selectList("ProcessStopItemDAO.selectProcessStopItemList", processStopItemVO);
    }

    /**
     * 공정별 중지항목을 등록한다.
     *
     * @param processStopItem
     * @throws Exception
     */
    public void insertProcessStopItem(ProcessStopItem processStopItem) throws Exception {
        insert("ProcessStopItemDAO.insertProcessStopItem", processStopItem);
    }

    /**
     * 공정별 중지항목을 수정한다.
     *
     * @param processStopItem
     * @throws Exception
     */
    public void updateProcessStopItem(ProcessStopItem processStopItem) throws Exception {
        update("ProcessStopItemDAO.updateProcessStopItem", processStopItem);
    }

    /**
     * 공정별 중지항목을 삭제한다.
     *
     * @param processStopItemId
     * @throws Exception
     */
    public void deleteProcessStopItem(String processStopItemId) throws Exception {
        delete("ProcessStopItemDAO.deleteProcessStopItem", processStopItemId);
    }
}
