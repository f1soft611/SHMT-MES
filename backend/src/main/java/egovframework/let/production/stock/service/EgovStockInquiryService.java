package egovframework.let.production.stock.service;

import egovframework.let.production.stock.domain.model.StockInquiryVO;

import java.util.Map;

/**
 * 재고조회 관리를 위한 서비스 인터페이스
 * @author SHMT-MES
 * @since 2026.02.13
 * @version 1.0
 * @see
 *
 * <pre>
 * << 개정이력(Modification Information) >>
 *
 *   수정일      수정자           수정내용
 *  -------    --------    ---------------------------
 *   2026.02.13 SHMT-MES          최초 생성
 *
 * </pre>
 */
public interface EgovStockInquiryService {

	/**
	 * ERP 프로시저를 호출하여 재고 목록을 조회한다. (페이징 포함)
	 * @param searchVO 검색 조건
	 * @return 재고 목록과 총 건수
	 * @throws Exception
	 */
	Map<String, Object> selectStockList(StockInquiryVO searchVO) throws Exception;
}
