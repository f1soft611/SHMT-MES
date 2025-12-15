package egovframework.let.production.order.domain.repository;

import egovframework.let.basedata.processFlow.domain.model.ProcessFlowItem;
import egovframework.let.cop.bbs.domain.model.Board;
import egovframework.let.cop.bbs.domain.model.BoardVO;
import egovframework.let.production.order.domain.model.ProductionOrder;
import egovframework.let.production.order.domain.model.ProductionOrderVO;
import org.egovframe.rte.psl.dataaccess.EgovAbstractMapper;
import org.springframework.stereotype.Repository;

import java.util.Iterator;
import java.util.List;
import java.util.Map;

/**
 * 생산 지시 관리를 위한 데이터 접근 클래스
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
@Repository("ProductionOrderDAO")
public class ProductionOrderDAO extends EgovAbstractMapper {

    /**
     * 조건에 맞는 생산 지시 목록을 조회 한다.
     *
     * @param productionOrderVO
     * @return
     * @throws Exception
     */
    public List<ProductionOrderVO> selectProductionOrderList(ProductionOrderVO productionOrderVO) throws Exception {
		return selectList("ProductionOrderDAO.selectProductionOrderList", productionOrderVO);
	}

    /**
     * 조건에 맞는 생산 지시 목록에 대한 전체 건수를 조회 한다.
     *
     * @param productionOrderVO
     * @return
     * @throws Exception
     */
    public int selectProductionOrderListCnt(ProductionOrderVO productionOrderVO) throws Exception {
        return (Integer)selectOne("ProductionOrderDAO.selectProductionOrderListCnt", productionOrderVO);
    }

    public List<Map<String, Object>> selectProdPlans(Map<String, Object> prodPlanSearchFilter) throws Exception {
        return selectList("ProductionOrderDAO.selectProdPlan", prodPlanSearchFilter);
    }

    // 생산지시] 생산지시 등록되기 전 제품의 공정 가져오기
    public List<Map<String, Object>> selectFlowProcessByPlanId(String prodPlanId) throws Exception {
        return selectList("ProductionOrderDAO.selectFlowProcess", prodPlanId);
    }

    // 생산지시] 생산지시 등록된 후 생산계획에 연결된 생산지시 조회
    public List<Map<String, Object>> selectProdOrdersByPlanId(String prodPlanId) throws Exception {
        return selectList("ProductionOrderDAO.selectProdOrders", prodPlanId);
    }

    // 생산지시] 생산지시 저장
    public void insertProductionOrder(Map<String, Object> prodOrder) throws Exception {
        insert("ProductionOrderDAO.insertProductionOrder", prodOrder);
    }

    // 생산지시] 생산지시 저장 -> 생산계획TPR301M ORDER FLAG UPDATE
    public void updateProdPlanOrderFlag(Map<String, Object> prodOrder) throws Exception {
        update("ProductionOrderDAO.updateProdPlanOrderFlag", prodOrder);
    }



}
