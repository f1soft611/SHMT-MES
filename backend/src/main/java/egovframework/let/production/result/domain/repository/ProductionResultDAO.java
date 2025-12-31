package egovframework.let.production.result.domain.repository;

import egovframework.let.production.result.domain.model.ProductionResult;
import org.egovframe.rte.psl.dataaccess.EgovAbstractMapper;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

/**
 * 생산계획 데이터 처리를 위한 DAO 클래스
 * EgovAbstractMapper를 상속받아 MyBatis SQL 처리를 수행한다.
 * * @author SHMT-MES
 * @since 2025.11.21
 * @version 1.0
 * @see
 *
 * <pre>
 * << 개정이력(Modification Information) >>
 *
 * 수정일      수정자           수정내용
 * -------    --------    ---------------------------
 * 2025.11.21 SHMT-MES          최초 생성 및 클래스 구현 방식으로 변경
 *
 * </pre>
 */
@Repository("ProductionResultDAO")
public class ProductionResultDAO extends EgovAbstractMapper {

	// 조건에 맞는 생산지시 목록 반환
	public List<Map<String, Object>> selectProductionOrderList(Map<String, Object> searchVO) throws Exception {
		return selectList("ProductionResultDAO.selectProductionOrderList", searchVO);
	}

	// 조건에 맞는 생산지시 전체 건 수
	public int selectProductionOrderListCount(Map<String, Object> searchVO) throws Exception {
		return (Integer)selectOne("ProductionResultDAO.selectProductionOrderListCount", searchVO);
	}

	// 생산실적 TPR601 nextId 가져오기
	public String selectProdResultNextId() throws Exception {
		return (String)selectOne("ProductionResultDAO.selectProdResultNextId");
	}

	// 생산실적 시퀀스 가져오기 PROD_SEQ
	public int selectProdSeq(Map<String, Object> params) throws Exception {
		return (Integer)selectOne("ProductionResultDAO.selectProdSeq", params);
	}

	// 생산실적 등록
	public void insertProductionResult(Map<String, Object> params) throws Exception {
		insert("ProductionResultDAO.insertProductionResult", params);
	}

	// 생산실적 수정
	public void updateProductionResult(Map<String, Object> params) throws Exception {
		update("ProductionResultDAO.updateProductionResult", params);
	}

	// 생산실적 작업자 TPR601W nextId 가져오기
	public String selectProdResultWorkerNextId() throws Exception {
		return (String)selectOne("ProductionResultDAO.selectProdResultWorkerNextId");
	}

	// 생산실적 시퀀스 가져오기 PROD_SEQ
	public int selectProdResultWorkerSeq(Map<String, Object> params) throws Exception {
		return (Integer)selectOne("ProductionResultDAO.selectProdResultWorkerSeq", params);
	}

	// 생산실적 -작업자 등록
	public void insertProductionResultWorker(Map<String, Object> params) throws Exception {
		insert("ProductionResultDAO.insertProductionResultWorker", params);
	}

	// 생산실적 -작업자 삭제
	public void deleteProductionResultWorker(Map<String, Object> params) throws Exception {
		delete("ProductionResultDAO.deleteProductionResultWorker", params);
	}

	// 생산실적 등록 후 TPR504 ORDER_FLAG UPDATE
	public void updateProdOrderOrderFlag(Map<String, Object> params) throws Exception {
		update("ProductionResultDAO.updateProdOrderOrderFlag", params);
	}

	//생산실적 detail 목록 조회
	public List<Map<String, Object>> selectProductionResultDetailList(Map<String, Object> searchVO) throws Exception {
		return selectList("ProductionResultDAO.selectProductionResultDetailList", searchVO);
	}

}