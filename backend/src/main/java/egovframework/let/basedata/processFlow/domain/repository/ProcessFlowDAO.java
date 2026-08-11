package egovframework.let.basedata.processFlow.domain.repository;

import egovframework.let.basedata.processFlow.domain.model.ProcessFlow;
import egovframework.let.basedata.processFlow.domain.model.ProcessFlowItem;
import egovframework.let.basedata.processFlow.domain.model.ProcessFlowProcess;
import egovframework.let.basedata.processFlow.domain.model.ProcessFlowVO;
import lombok.extern.slf4j.Slf4j;
import org.egovframe.rte.psl.dataaccess.EgovAbstractMapper;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.HashMap;
import java.util.Map;

@Slf4j
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
        log.info("==========> selectProcessFlowList <==========");
        return selectList("ProcessFlowDAO.selectProcessFlowList", processFlowVO);
    }

    public int selectProcessFlowListCnt(ProcessFlowVO processFlowVO){
        log.info("==========> selectProcessFlowListCnt <==========");
        return selectOne("ProcessFlowDAO.selectProcessFlowListCnt", processFlowVO);
    }

    public void createProcessFlow(ProcessFlow pf) {
        log.info("==========> insertProcessFlow <==========");
        insert("ProcessFlowDAO.insertProcessFlow", pf);
    }

    // WF0000 코드 자동채번
    public String selectProcessFlowCode(){
        log.info("==========> selectProcessFlowCode <==========");
        return selectOne("ProcessFlowDAO.selectProcessFlowCode");
    }

    // WF202512120001 ID 자동채번
    public String selectTPR110NextId(){
        log.info("==========> selectTPR110NextId <==========");
        return selectOne("ProcessFlowDAO.selectTPR110NextId");
    }

    public void updateProcessFlow(ProcessFlow processFlow) {
        log.info("==========> updateProcessFlow <==========");
        update("ProcessFlowDAO.updateProcessFlow", processFlow);
    }

    public void deleteProcessFlow(String processFlowId) {
        log.info("==========> deleteProcessFlow <==========");
        delete("ProcessFlowDAO.deleteProcessFlow", processFlowId);
    }

    public ProcessFlow selectProcessFlowByIdAndFactory(String processFlowId, String factoryCode) {
        Map<String, String> params = new HashMap<>();
        params.put("processFlowId", processFlowId);
        params.put("factoryCode", factoryCode);
        log.info("==========> selectProcessFlowByIdAndFactory <==========");
        return selectOne("ProcessFlowDAO.selectProcessFlowByIdAndFactory", params);
    }

    public void deleteProcessFlowProcess(String processFlowId, String factoryCode) {
        Map<String, String> params = new HashMap<>();
        params.put("processFlowId", processFlowId);
        params.put("factoryCode", factoryCode);
        log.info("==========> deleteAllByProcessFlowId <==========");
        delete("ProcessFlowProcessDAO.deleteAllByProcessFlowId", params);
    }

    public void insertProcessFlowProcess(ProcessFlowProcess p) {
        log.info("==========> insertProcessFlowProcess <==========");
        insert("ProcessFlowProcessDAO.insertProcessFlowProcess", p);
    }

    public List<ProcessFlowProcess> selectProcessByFlowId(
            String processFlowId, String factoryCode) {
        Map<String, String> params = new HashMap<>();
        params.put("processFlowId", processFlowId);
        params.put("factoryCode", factoryCode);
        log.info("==========> selectByProcessFlowId <==========");
        return selectList("ProcessFlowProcessDAO.selectByProcessFlowId", params);
    }

    public List<String> selectOwnedFlowItemIds(
            String processFlowId, String factoryCode, List<String> flowItemIds) {
        Map<String, Object> params = new HashMap<>();
        params.put("processFlowId", processFlowId);
        params.put("factoryCode", factoryCode);
        params.put("flowItemIds", flowItemIds);
        log.info("==========> selectOwnedFlowItemIds <==========");
        return selectList("ProcessFlowItemDAO.selectOwnedFlowItemIds", params);
    }

    public List<String> selectRegisteredItemIds(List<String> itemIds) {
        Map<String, Object> params = new HashMap<>();
        params.put("itemIds", itemIds);
        log.info("==========> selectRegisteredItemIds <==========");
        return selectList("ProcessFlowItemDAO.selectRegisteredItemIds", params);
    }

    public List<ProcessFlowItem> selectItemMasters(String factoryCode, List<String> itemIds) {
        Map<String, Object> params = new HashMap<>();
        params.put("factoryCode", factoryCode);
        params.put("itemIds", itemIds);
        log.info("==========> selectItemMasters <==========");
        return selectList("ProcessFlowItemDAO.selectItemMasters", params);
    }

    public int deleteProcessFlowItems(
            String processFlowId, String factoryCode, List<String> flowItemIds) {
        Map<String, Object> params = new HashMap<>();
        params.put("processFlowId", processFlowId);
        params.put("factoryCode", factoryCode);
        params.put("flowItemIds", flowItemIds);
        log.info("==========> deleteProcessFlowItems <==========");
        return delete("ProcessFlowItemDAO.deleteProcessFlowItems", params);
    }

    public void insertProcessFlowItem(ProcessFlowItem item) {
        log.info("==========> insertProcessFlowItem <==========");
        insert("ProcessFlowItemDAO.insertProcessFlowItem", item);
    }

    public List<ProcessFlowItem> selectItemByFlowId(
            String processFlowId, String factoryCode) {
        Map<String, String> params = new HashMap<>();
        params.put("processFlowId", processFlowId);
        params.put("factoryCode", factoryCode);
        log.info("==========> selectItemByFlowId <==========");
        return selectList("ProcessFlowItemDAO.selectItemByFlowId", params);
    }
}
