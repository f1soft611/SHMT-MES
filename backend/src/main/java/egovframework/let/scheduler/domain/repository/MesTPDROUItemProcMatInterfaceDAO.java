package egovframework.let.scheduler.domain.repository;

import egovframework.let.scheduler.domain.model.ErpTPDROUItemProcMat;
import org.egovframe.rte.psl.dataaccess.EgovAbstractMapper;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

/**
 * MES 제품별공정별소요자재(TCO501) 인터페이스 DAO (MES 데이터베이스 쓰기)
 * @author SHMT-MES
 * @since 2025.12.08
 */
@Repository("mesTPDROUItemProcMatInterfaceDAO")
public class MesTPDROUItemProcMatInterfaceDAO extends EgovAbstractMapper {

    /**
     * MES 제품별공정별소요자재(TCO501) 정보 존재 여부 확인
     * @param param 복합키 Map
     * @return 존재 개수
     * @throws Exception
     */
    public int selectMesTPDROUItemProcMatCount(Map<String, Object> param) throws Exception {
        return (Integer) selectOne("MesTPDROUItemProcMatInterfaceDAO.selectMesTPDROUItemProcMatCount", param);
    }

    /**
     * MES 제품별공정별소요자재(TCO501) 정보 삽입
     * @param param ERP 제품별공정별소요자재 정보
     * @throws Exception
     */
    public void insertMesTPDROUItemProcMat(Map<String, Object> param) throws Exception {
        insert("MesTPDROUItemProcMatInterfaceDAO.insertMesTPDROUItemProcMat", param);
    }

    /**
     * MES 제품별공정별소요자재(TCO501) 정보 업데이트
     * @param param ERP 제품별공정별소요자재 정보
     * @throws Exception
     */
    public void updateMesTPDROUItemProcMat(Map<String, Object> param) throws Exception {
        update("MesTPDROUItemProcMatInterfaceDAO.updateMesTPDROUItemProcMat", param);
    }

    /**
     * 루트 품목 기준 재귀적으로 TCO501에 저장된 BOM 트리의 ITEM_SEQ 전체 조회
     * @param itemSeq 루트 품목의 ERP ItemSeq
     * @return 루트 + 재귀적 하위 자재의 ITEM_SEQ 목록
     * @throws Exception
     */
    public List<Integer> selectTPDROUItemProcMatTreeItemSeqs(int itemSeq) throws Exception {
        return selectList("MesTPDROUItemProcMatInterfaceDAO.selectTPDROUItemProcMatTreeItemSeqs", itemSeq);
    }

    /**
     * ITEM_SEQ 목록에 해당하는 TCO501 행 전체 삭제
     * @param itemSeqs 삭제할 ITEM_SEQ 목록
     * @throws Exception
     */
    public void deleteMesTPDROUItemProcMatByItemSeqs(List<Integer> itemSeqs) throws Exception {
        if (itemSeqs.isEmpty()) {
            return;
        }
        delete("MesTPDROUItemProcMatInterfaceDAO.deleteMesTPDROUItemProcMatByItemSeqs", itemSeqs);
    }
}
