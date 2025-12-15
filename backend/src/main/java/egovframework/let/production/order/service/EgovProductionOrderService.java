package egovframework.let.production.order.service;


import egovframework.let.production.order.domain.model.ProductionOrderVO;

import java.util.List;
import java.util.Map;

/**
 * 생산 지시를 관리하기 위한 서비스 인터페이스  클래스
 * @author 김기형
 * @since 2025.07.22
 * @version 1.0
 * @see
 *
 * <pre>
 * << 개정이력(Modification Information) >>
 *
 *   수정일      수정자           수정내용
 *  -------    --------    ---------------------------
 *   2025.07.22 김기형          최초 생성
 *
 * </pre>
 */
public interface EgovProductionOrderService {

	/**
	 * 조건에 맞는 생산 지시 목록을 조회 한다.
	 * @return
	 * 
	 * @param productionOrderVO
	 * @param attrbFlag
	 * @exception Exception Exception
	 */
	public Map<String, Object> selectProductionOrderList(ProductionOrderVO productionOrderVO, String attrbFlag)
	  throws Exception;


	List<Map<String, Object>> selectProdPlans(String workCenter, String dateFrom, String dateTo) throws Exception;


	List<Map<String, Object>> selectFlowProcessByPlanId(String prodPlanId) throws Exception;
	List<Map<String, Object>> selectProdOrdersByPlanId(String prodPlanId) throws Exception;


	void insertProductionOrders(List<Map<String, Object>> prodOrderList) throws Exception;

}