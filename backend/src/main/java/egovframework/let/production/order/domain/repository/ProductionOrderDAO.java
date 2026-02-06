package egovframework.let.production.order.domain.repository;

import egovframework.let.production.order.domain.model.*;
import org.egovframe.rte.psl.dataaccess.EgovAbstractMapper;
import org.springframework.stereotype.Repository;

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
     * 조건에 맞는 생산 계획 목록에 대한 전체 건수를 조회 한다.
     *
     * @param param
     * @return
     * @throws Exception
     */
    public int selectProdPlanCount(ProdPlanSearchParam param) throws Exception {
        return (Integer)selectOne("ProductionOrderDAO.selectProdPlanCount", param);
    }

    /**
     * 조건에 맞는 생산 계획 목록에 대한 전체 목록을 조회 한다.
     *
     * @param param
     * @return
     * @throws Exception
     */
    public List<ProdPlanRow> selectProdPlans(ProdPlanSearchParam param) throws Exception {
        return selectList("ProductionOrderDAO.selectProdPlan", param);
    }

    // 생산지시] 생산지시 등록되기 전 제품의 공정 가져오기
    public List<ProdOrderRow> selectFlowProcessByPlanId(ProdOrderSearchParam param) throws Exception {
        return selectList("ProductionOrderDAO.selectFlowProcess", param);
    }

    // 생산지시] 생산지시 등록된 후 생산계획에 연결된 생산지시 조회
    public List<ProdOrderRow> selectProdOrdersByPlanId(ProdOrderSearchParam param) throws Exception {
        return selectList("ProductionOrderDAO.selectProdOrders", param);
    }

    // 생산지시] 생산지시 저장 전 nextId 가져오기
    public String selectProdOrderNextId(){
        return selectOne("ProductionOrderDAO.selectProdOrderNextId");
    }

    // 생산지시] 생산지시 저장 전 WORK_SEQ 가져오기
    public int selectProdOrderWorkSeq(ProdOrderInsertDto dto) throws Exception {
        return (Integer)selectOne("ProductionOrderDAO.selectProdOrderWorkSeq", dto);
    }

    // 생산지시] 생산지시 저장
    public void insertProductionOrder(ProdOrderInsertDto dto) throws Exception {
        insert("ProductionOrderDAO.insertProductionOrder", dto);
    }

    // 생산지시] 생산지시 저장 -> 생산계획TPR301M ORDER FLAG UPDATE
    // 생산지시] 생산지시 삭제 -> 생산계획TPR301M ORDER FLAG UPDATE
    public void updateProdPlanOrderFlag(ProdPlanOrderFlagDto dto) {
        update("ProductionOrderDAO.updateProdPlanOrderFlag", dto);
    }

    // 생산지시] 생산지시 삭제
    public void deleteProductionOrder(ProdOrderDeleteDto dto) throws Exception {
        delete("ProductionOrderDAO.deleteProductionOrder", dto);
    }

    // 생산지시] 해당 지시에 등록된 생산실적 있는지 확인
    public int selectProdResultCount(ProdOrderDeleteDto dto) throws Exception {
        return (Integer)selectOne("ProductionOrderDAO.selectProdResultCount", dto);
    }

    // 생산지시] 생산지시 수정
    public void updateProductionOrder(ProdOrderUpdateDto dto) throws Exception {
        update("ProductionOrderDAO.updateProductionOrder", dto);
    }

    // 생산지시] key로 이미 등록되어있는지 확인
    public int selectProdPlanOrderedCount(ProdPlanKeyDto dto) throws Exception {
        return (Integer)selectOne("ProductionOrderDAO.selectProdPlanOrderedCount", dto);
    }

}
