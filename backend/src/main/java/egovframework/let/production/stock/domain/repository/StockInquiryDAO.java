package egovframework.let.production.stock.domain.repository;

import egovframework.let.production.stock.domain.model.StockInquiry;
import egovframework.let.production.stock.domain.model.StockInquiryVO;
import org.egovframe.rte.psl.dataaccess.EgovAbstractMapper;
import org.mybatis.spring.SqlSessionTemplate;
import org.springframework.stereotype.Repository;

import javax.annotation.Resource;
import java.util.List;

/**
 * 재고조회 데이터 처리를 위한 DAO 클래스
 * EgovAbstractMapper를 상속받아 MyBatis SQL 처리를 수행한다.
 * ERP DB의 프로시저를 호출하기 위해 erpSqlSessionTemplate을 사용한다.
 * @author SHMT-MES
 * @since 2026.02.13
 * @version 1.0
 * @see
 *
 * <pre>
 * << 개정이력(Modification Information) >>
 *
 * 수정일      수정자           수정내용
 * -------    --------    ---------------------------
 * 2026.02.13 SHMT-MES          최초 생성
 * 2026.02.13 SHMT-MES          ERP DB 프로시저 호출로 변경
 *
 * </pre>
 */
@Repository("StockInquiryDAO")
public class StockInquiryDAO extends EgovAbstractMapper {

	@Resource(name = "erpSqlSessionTemplate")
	public void setErpSqlSessionTemplate(SqlSessionTemplate sqlSessionTemplate) {
		super.setSqlSessionTemplate(sqlSessionTemplate);
	}

	/**
	 * ERP 프로시저를 호출하여 재고 목록을 조회한다.
	 * XML 매퍼의 'StockInquiryDAO.selectStockList' ID를 호출한다.
	 * @param searchVO 검색 조건
	 * @return 재고 목록
	 * @throws Exception SQL 실행 중 오류 발생 시
	 */
	public List<StockInquiry> selectStockList(StockInquiryVO searchVO) throws Exception {
		return selectList("StockInquiryDAO.selectStockList", searchVO);
	}

	/**
	 * 재고 목록의 총 건수를 조회한다.
	 * XML 매퍼의 'StockInquiryDAO.selectStockListCount' ID를 호출한다.
	 * @param searchVO 검색 조건
	 * @return 총 건수
	 * @throws Exception SQL 실행 중 오류 발생 시
	 */
	public int selectStockListCount(StockInquiryVO searchVO) throws Exception {
		return selectOne("StockInquiryDAO.selectStockListCount", searchVO);
	}
}
