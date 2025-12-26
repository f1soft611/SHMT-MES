package egovframework.let.basedata.processFlow.domain.repository;

import egovframework.let.basedata.processFlow.domain.model.ProcessFlow;
import egovframework.let.basedata.processFlow.domain.model.ProcessFlowItem;
import egovframework.let.basedata.processFlow.domain.model.ProcessFlowProcess;
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

    public int selectProcessFlowListCnt(ProcessFlowVO processFlowVO){
        return selectOne("ProcessFlowDAO.selectProcessFlowListCnt", processFlowVO);
    }

    public void createProcessFlow(ProcessFlow pf) {
        insert("ProcessFlowDAO.insertProcessFlow", pf);
    }


    public void updateProcessFlow(ProcessFlow processFlow) {
        update("ProcessFlowDAO.updateProcessFlow", processFlow);
    }

    public void deleteProcessFlow(String processFlowId) {
        delete("ProcessFlowDAO.deleteProcessFlow", processFlowId);
    }

    public void deleteProcessFlowProcess(String workOderId) {
        delete("ProcessFlowProcessDAO.deleteAllByProcessFlowId", workOderId);
    }

    public void insertProcessFlowProcess(ProcessFlowProcess p) {
        insert("ProcessFlowProcessDAO.insertProcessFlowProcess", p);
    }

    public List<ProcessFlowProcess> selectProcessByFlowId(String processFlowId) {
        return selectList("ProcessFlowProcessDAO.selectByProcessFlowId", processFlowId);
    }

    public void deleteProcessFlowItem(String workOderId) {
        delete("ProcessFlowItemDAO.deleteAllByProcessFlowId", workOderId);
    }

    public void deleteProcessFlowItemById(String flowItemId) {
        delete("ProcessFlowItemDAO.deleteProcessFlowItemById", flowItemId);
    }

    public void insertProcessFlowItem(ProcessFlowItem item) {
        insert("ProcessFlowItemDAO.insertProcessFlowItem", item);
    }

    public List<ProcessFlowItem> selectItemByFlowId(String processFlowId) {
        return selectList("ProcessFlowItemDAO.selectItemByFlowId", processFlowId);
    }
}