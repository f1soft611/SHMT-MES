package egovframework.let.basedata.processFlow.service;


import egovframework.let.basedata.processFlow.domain.model.ProcessFlow;
import egovframework.let.basedata.processFlow.domain.model.ProcessFlowVO;

import java.util.List;
import java.util.Map;

/**
 * 공정 흐름 관리를 위한 서비스 인터페이스 클래스
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
 *   2025.11.11 SHMT-MES          최초 생성
 *
 * </pre>
 */
public interface EgovProcessFlowService {

	/**
	 * 공정 목록을 조회한다.
	 * 
	 * @param processFlowVO
	 * @exception Exception
	 */
	public Map<String, Object> selectProcessFlowList(ProcessFlowVO processFlowVO) throws Exception;

	void createProcessFlow(ProcessFlow pf) throws Exception;

	List<Map<String, Object>> selectProcessByFlowId(String processFlowId) throws Exception;
	List<Map<String, Object>> selectItemByFlowId(String processFlowId) throws Exception;

	void updateProcessFlow(ProcessFlow processFlow) throws Exception;
	void deleteProcessFlow(String processFlowId) throws Exception;
}
