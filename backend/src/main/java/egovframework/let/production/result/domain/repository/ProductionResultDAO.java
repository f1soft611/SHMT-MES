package egovframework.let.production.result.domain.repository;

import egovframework.let.production.result.domain.model.*;
import org.egovframe.rte.psl.dataaccess.EgovAbstractMapper;
import org.springframework.stereotype.Repository;

import java.util.List;

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
	public List<ProdResultOrderRow> selectProductionOrderList(ProdResultSearchDto searchVO) throws Exception {
		return selectList("ProductionResultDAO.selectProductionOrderList", searchVO);
	}

	// 조건에 맞는 생산지시 전체 건 수
	public int selectProductionOrderListCount(ProdResultSearchDto searchVO) throws Exception {
		return (Integer)selectOne("ProductionResultDAO.selectProductionOrderListCount", searchVO);
	}

	// 생산실적 TPR601 nextId 가져오기
	public String selectProdResultNextId() throws Exception {
		return (String)selectOne("ProductionResultDAO.selectProdResultNextId");
	}

	// 생산실적 시퀀스 가져오기 PROD_SEQ
	public int selectProdSeq(ProdResultInsertDto params) throws Exception {
		return (Integer)selectOne("ProductionResultDAO.selectProdSeq", params);
	}

	// 생산실적 등록
	public void insertProductionResult(ProdResultInsertDto dto) throws Exception {
		insert("ProductionResultDAO.insertProductionResult", dto);
	}

	// 생산실적 수정
	public void updateProductionResult(ProdResultUpdateDto dto) throws Exception {
		update("ProductionResultDAO.updateProductionResult", dto);
	}

	// 생산실적 삭제
	public void deleteProductionResult(ProdResultDeleteDto dto) throws Exception {
		delete("ProductionResultDAO.deleteProductionResult", dto);
	}

	// 생산실적 작업자 TPR601W nextId 가져오기
	public String selectProdResultWorkerNextId() throws Exception {
		return (String)selectOne("ProductionResultDAO.selectProdResultWorkerNextId");
	}

	// 생산실적 시퀀스 가져오기 PROD_SEQ
	public int selectProdResultWorkerSeq(ProdResultWorkerDto dto) throws Exception {
		return (Integer)selectOne("ProductionResultDAO.selectProdResultWorkerSeq", dto);
	}

	// 생산실적 -작업자 등록
	public void insertProductionResultWorker(ProdResultWorkerDto dto) throws Exception {
		insert("ProductionResultDAO.insertProductionResultWorker", dto);
	}

	// 생산실적 -작업자 삭제 (오버로드)
	public void deleteProductionResultWorker(ProdResultDetailParent dto) throws Exception {
		delete("ProductionResultDAO.deleteProductionResultWorker", dto);
	}

	// 생산실적 -작업자 삭제 (오버로드)
	public void deleteProductionResultWorker(ProdResultDeleteDto dto) throws Exception {
		delete("ProductionResultDAO.deleteProductionResultWorker", dto);
	}

	// 생산실적 -투입자재 삭제
	public void deleteProductionResultMaterial(ProdResultDetailParent dto) throws Exception {
		delete("ProductionResultDAO.deleteProductionResultMaterial", dto);
	}

	// 생산실적 등록 후 TPR504 ORDER_FLAG UPDATE
	public void updateProdOrderOrderFlag(ProdResultOrderFlagDto dto) throws Exception {
		update("ProductionResultDAO.updateProdOrderOrderFlag", dto);
	}

	//생산실적 detail 목록 조회
	public List<ProdResultRow> selectProductionResultDetailList(ProdResultDto dto) throws Exception {
		return selectList("ProductionResultDAO.selectProductionResultDetailList", dto);
	}

}