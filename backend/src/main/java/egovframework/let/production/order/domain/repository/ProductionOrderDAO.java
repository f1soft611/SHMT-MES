package egovframework.let.production.order.domain.repository;

import egovframework.let.production.order.domain.model.*;
import lombok.extern.slf4j.Slf4j;
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
@Slf4j
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
        log.info("==========> selectProductionOrderList <==========");
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
        log.info("==========> selectProdPlanCount <==========");
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
        log.info("==========> selectProdPlans <==========");
        return selectList("ProductionOrderDAO.selectProdPlan", param);
    }

    // 생산지시] 생산계획의 루트 품목(ERP ItemSeq) 목록 조회
    public List<Integer> selectRootItemCodesByPlan(ProdOrderSearchParam param) throws Exception {
        log.info("==========> selectRootItemCodesByPlan <==========");
        return selectList("ProductionOrderDAO.selectRootItemCodesByPlan", param);
    }

    // 생산지시] 생산지시 등록되기 전 제품의 공정 가져오기
    public List<ProdOrderRow> selectFlowProcessByPlanId(ProdOrderSearchParam param) throws Exception {
        log.info("==========> selectFlowProcessByPlanId <==========");
        return selectList("ProductionOrderDAO.selectFlowProcess", param);
    }

    // 생산지시] 생산지시 등록된 후 생산계획에 연결된 생산지시 조회
    public List<ProdOrderRow> selectProdOrdersByPlanId(ProdOrderSearchParam param) throws Exception {
        log.info("==========> selectProdOrdersByPlanId <==========");
        return selectList("ProductionOrderDAO.selectProdOrders", param);
    }

    // 생산지시] 생산지시 저장 전 nextId 가져오기
    public String selectProdOrderNextId(){
        log.info("==========> selectProdOrderNextId <==========");
        return selectOne("ProductionOrderDAO.selectProdOrderNextId");
    }

    // 생산지시] 생산지시 저장 전 WORK_SEQ 가져오기
    public int selectProdOrderWorkSeq(ProdOrderInsertDto dto) throws Exception {
        log.info("==========> selectProdOrderWorkSeq <==========");
        return (Integer)selectOne("ProductionOrderDAO.selectProdOrderWorkSeq", dto);
    }

    // 생산지시] 생산지시 저장
    public void insertProductionOrder(ProdOrderInsertDto dto) throws Exception {
        log.info("==========> insertProductionOrder <==========");
        insert("ProductionOrderDAO.insertProductionOrder", dto);
    }

    // 생산지시] 생산지시 저장 -> 생산계획TPR301 ORDER FLAG UPDATE
    // 생산지시] 생산지시 삭제 -> 생산계획TPR301 ORDER FLAG UPDATE
    public void updateProdPlanOrderFlag(ProdPlanOrderFlagDto dto) {
        log.info("==========> updateProdPlanOrderFlag <==========");
        update("ProductionOrderDAO.updateProdPlanOrderFlag", dto);
    }

    public void updateProdPlanOrderFlag2(ProdPlanOrderFlagDto dto) {
        log.info("==========> updateProdPlanOrderFlag2 <==========");
        update("ProductionOrderDAO.updateProdPlanOrderFlag2", dto);
    }

    // 생산지시] 생산지시 저장 -> 생산계획TPR301 LOT NO UPDATE
    // 생산지시] 생산지시 삭제 -> 생산계획TPR301 LOT NO UPDATE
    public void updateProdPlanLotNo(ProdPlanLotNoDto dto) {
        log.info("==========> updateProdPlanLotNo <==========");
        update("ProductionOrderDAO.updateProdPlanLotNo", dto);
    }
    public void updateProdPlanLotNo2(ProdPlanLotNoDto dto) {
        log.info("==========> updateProdPlanLotNo2 <==========");
        update("ProductionOrderDAO.updateProdPlanLotNo2", dto);
    }

    // 생산지시] erp에 삭제요청시 mes 내에서는 order_flag만 선 변경
    public void deleteReqProductionOrder(ProdOrderDeleteDto dto) throws Exception {
        log.info("==========> deleteReqProductionOrder <==========");
        update("ProductionOrderDAO.deleteReqProductionOrder", dto);

    }

    // 생산지시] 생산지시 삭제
    public void deleteProductionOrder(ProdOrderDeleteDto dto) throws Exception {
        log.info("==========> deleteProductionOrder <==========");
        update("ProductionOrderDAO.deleteProductionOrder", dto);
    }

    // 생산지시] 해당 지시에 등록된 생산실적 있는지 확인
    public int selectProdResultCount(ProdOrderDeleteDto dto) throws Exception {
        log.info("==========> selectProdResultCount <==========");
        return (Integer)selectOne("ProductionOrderDAO.selectProdResultCount", dto);
    }

    // 생산지시] 생산지시 수정
    public void updateProductionOrder(ProdOrderUpdateDto dto) throws Exception {
        log.info("==========> updateProductionOrder <==========");
        update("ProductionOrderDAO.updateProductionOrder", dto);
    }

    // 생산지시] key로 이미 등록되어있는지 확인
    public int selectProdPlanOrderedCount(ProdPlanKeyDto dto) throws Exception {
        log.info("==========> selectProdPlanOrderedCount <==========");
        return (Integer)selectOne("ProductionOrderDAO.selectProdPlanOrderedCount", dto);
    }

    /** 작업중단 — TPR504 지시 행 ORDER_FLAG='S' */
    public void stopWorkTpr504(StopWorkDto dto) throws Exception {
        log.info("==========> stopWorkTpr504 <==========");
        update("ProductionOrderDAO.stopWorkTpr504", dto);
    }

    /** 작업중단 — TPR301 계획 행 ORDER_FLAG='STOPPED' + PROD_QTY */
    public void stopWorkTpr301(StopWorkDto dto) throws Exception {
        log.info("==========> stopWorkTpr301 <==========");
        update("ProductionOrderDAO.stopWorkTpr301", dto);
    }

    /** 작업중단 — TPR301M 마스터 행 ORDER_FLAG='STOPPED' */
    public void stopWorkTpr301M(StopWorkDto dto) throws Exception {
        log.info("==========> stopWorkTpr301M <==========");
        update("ProductionOrderDAO.stopWorkTpr301M", dto);
    }

    /** 작업중단 — TPR301R 수주연동행 ORDER_QTY UPDATE */
    public void stopWorkTpr301R(StopWorkDto dto) throws Exception {
        log.info("==========> stopWorkTpr301R <==========");
        update("ProductionOrderDAO.stopWorkTpr301R", dto);
    }

    // ERP 결과 동기화: 생산계획 키로 PRODORDER_ID 목록 조회
    public List<String> selectProdorderIdsByPlanKey(ProdPlanKeyDto dto) {
        log.info("==========> selectProdorderIdsByPlanKey <==========");
        return selectList("ProductionOrderDAO.selectProdorderIdsByPlanKey", dto);
    }

    // ERP 결과 동기화: TPR504에 ERP 처리 결과 업데이트
    public int updateErpResultByProdorderId(ErpIFProdOrderResultDto dto) {
        log.info("==========> updateErpResultByProdorderId <==========");
        return update("ProductionOrderDAO.updateErpResultByProdorderId", dto);
    }

    // ERP 결과 동기화: PRODORDER_ID로 소속 생산계획 키 조회
    public ProdPlanKeyDto selectProdPlanKeyByProdorderId(String prodorderId) {
        log.info("==========> selectProdPlanKeyByProdorderId <==========");
        return selectOne("ProductionOrderDAO.selectProdPlanKeyByProdorderId", prodorderId);
    }
}
