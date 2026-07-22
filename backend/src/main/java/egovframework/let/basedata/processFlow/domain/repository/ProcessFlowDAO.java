package egovframework.let.basedata.processFlow.domain.repository;

import egovframework.let.basedata.processFlow.domain.model.ProcessFlow;
import egovframework.let.basedata.processFlow.domain.model.ProcessFlowItem;
import egovframework.let.basedata.processFlow.domain.model.ProcessFlowProcess;
import egovframework.let.basedata.processFlow.domain.model.ProcessFlowVO;
import org.egovframe.rte.psl.dataaccess.EgovAbstractMapper;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.HashMap;
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

    // WF0000 코드 자동채번
    public String selectProcessFlowCode(){
        return selectOne("ProcessFlowDAO.selectProcessFlowCode");
    }

    // WF202512120001 ID 자동채번
    public String selectTPR110NextId(){
        return selectOne("ProcessFlowDAO.selectTPR110NextId");
    }

    public void updateProcessFlow(ProcessFlow processFlow) {
        update("ProcessFlowDAO.updateProcessFlow", processFlow);
    }

    public void deleteProcessFlow(String processFlowId) {
        delete("ProcessFlowDAO.deleteProcessFlow", processFlowId);
    }

    public ProcessFlow selectProcessFlowByIdAndFactory(String processFlowId, String factoryCode) {
        Map<String, String> params = new HashMap<>();
        params.put("processFlowId", processFlowId);
        params.put("factoryCode", factoryCode);
        return selectOne("ProcessFlowDAO.selectProcessFlowByIdAndFactory", params);
    }

    public void deleteProcessFlowProcess(String processFlowId, String factoryCode) {
        Map<String, String> params = new HashMap<>();
        params.put("processFlowId", processFlowId);
        params.put("factoryCode", factoryCode);
        delete("ProcessFlowProcessDAO.deleteAllByProcessFlowId", params);
    }

    public void insertProcessFlowProcess(ProcessFlowProcess p) {
        insert("ProcessFlowProcessDAO.insertProcessFlowProcess", p);
    }

    public List<ProcessFlowProcess> selectProcessByFlowId(
            String processFlowId, String factoryCode) {
        Map<String, String> params = new HashMap<>();
        params.put("processFlowId", processFlowId);
        params.put("factoryCode", factoryCode);
        return selectList("ProcessFlowProcessDAO.selectByProcessFlowId", params);
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
