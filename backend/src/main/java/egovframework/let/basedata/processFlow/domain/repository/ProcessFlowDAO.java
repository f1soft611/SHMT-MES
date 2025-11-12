package egovframework.let.basedata.processFlow.domain.repository;

import egovframework.let.basedata.process.domain.model.ProcessVO;
import egovframework.let.basedata.processFlow.domain.model.ProcessFlow;
import egovframework.let.basedata.processFlow.domain.model.ProcessFlowVO;
import org.egovframe.rte.psl.dataaccess.EgovAbstractMapper;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository("ProcessFlowDAO")
public class ProcessFlowDAO extends EgovAbstractMapper {

    /**
     * 공정 흐름 목록을 조회한다.
     *
     * @param processFlowVO
     * @return
     * @throws Exception
     */
    public List<ProcessFlowVO> selectProcessFlowList(ProcessFlowVO processFlowVO) throws Exception {
        return selectList("ProcessFlowDAO.selectProcessFlowList", processFlowVO);
    }

    public void createProcessFlow(ProcessFlow pf) {
        insert("ProcessFlowDAO.insertProcessFlow", pf);
    }

    public List<Map<String, Object>> selectProcessByFlowId(String processFlowId) {
        return selectList("ProcessFlowDAO.selectProcessByFlowId", processFlowId);
    }

    public List<Map<String, Object>> selectItemByFlowId(String processFlowId) {
        return selectList("ProcessFlowDAO.selectItemByFlowId", processFlowId);
    }

    public void updateProcessFlow(ProcessFlow processFlow) {
        update("ProcessFlowDAO.updateProcessFlow", processFlow);
    }

    public void deleteProcessFlow(String processFlowId) {
        delete("ProcessFlowDAO.deleteProcessFlow", processFlowId);
    }
}