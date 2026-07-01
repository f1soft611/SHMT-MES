package egovframework.let.production.order.service;


import egovframework.let.common.dto.ListResult;
import egovframework.let.production.order.domain.model.*;

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
	 * @param productionOrderVO
	 * @param attrbFlag
	 * @exception Exception Exception
	 */
	Map<String, Object> selectProductionOrderList(ProductionOrderVO productionOrderVO, String attrbFlag) throws Exception;


	ListResult<ProdPlanRow> selectProdPlans(ProdPlanSearchParam param) throws Exception;


	ListResult<ProdOrderRow> selectFlowProcessByPlanId(ProdOrderSearchParam param) throws Exception;
	ListResult<ProdOrderRow> selectProdOrdersByPlanId(ProdOrderSearchParam param) throws Exception;


	// 생산지시 저장
	void insertProductionOrders(List<ProdOrderInsertDto> prodOrderList) throws Exception;

	// 생산지시 수정
	void updateProductionOrders(List<ProdOrderUpdateDto> prodOrderList) throws Exception;

	// 생산지시 삭제
	void deleteProductionOrder(ProdOrderDeleteDto dto) throws Exception;

	// 생산지시 일괄 저장
	boolean bulkCreateProductionOrders(List<ProdPlanKeyDto> prodOrderList) throws Exception;

	// 생산지시 일괄 삭제
	void bulkCancelProductionOrders(List<ProdPlanKeyDto> prodOrderList) throws Exception;

	/**
	 * 선택한 생산계획의 공정 데이터를 ERP IF 테이블에 재전송
	 * ERP에 이미 존재하는 mesIfKey는 건너뜀
	 * @param plans 재전송 대상 생산계획 키 목록
	 * @return ERP 전송 성공 여부 (실패 시 false)
	 */
	boolean resendErpIf(List<ProdPlanKeyDto> plans) throws Exception;

	/** 작업중단 처리 — TPR504 ORDER_FLAG='S', TPR301/M ORDER_FLAG='STOPPED', TPR301.PROD_QTY=변경수량 */
	void stopWork(StopWorkDto dto) throws Exception;


	/**
	 * 선택한 생산계획 행의 ERP 처리 결과를 ERP IF 테이블에서 읽어 TPR504에 반영
	 * @return 업데이트된 건수
	 */
	int syncErpResult(List<ProdPlanKeyDto> plans) throws Exception;

}