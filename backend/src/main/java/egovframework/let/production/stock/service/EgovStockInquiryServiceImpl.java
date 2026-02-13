package egovframework.let.production.stock.service;

import egovframework.let.production.stock.domain.model.StockInquiry;
import egovframework.let.production.stock.domain.model.StockInquiryVO;
import egovframework.let.production.stock.domain.repository.StockInquiryDAO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 재고조회 관리를 위한 서비스 구현 클래스
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
@Service("EgovStockInquiryService")
@RequiredArgsConstructor
public class EgovStockInquiryServiceImpl implements EgovStockInquiryService {

	private final StockInquiryDAO stockInquiryDAO;

	/**
	 * ERP 프로시저를 호출하여 재고 목록을 조회한다. (Java에서 페이징 처리)
	 * 
	 * ERP 프로시저가 페이징을 지원하지 않으므로, 전체 데이터를 조회 후 Java에서 페이징 처리한다.
	 * 
	 * @param searchVO 검색 조건 (pageIndex, pageSize 포함)
	 * @return 페이징된 재고 목록과 총 건수
	 * @throws Exception
	 */
	@Override
	public Map<String, Object> selectStockList(StockInquiryVO searchVO) throws Exception {
		Map<String, Object> resultMap = new HashMap<>();

		// ERP 프로시저 호출하여 전체 재고 목록 조회
		List<StockInquiry> allStockList = stockInquiryDAO.selectStockList(searchVO);
		
		// 전체 건수 계산
		int totalCount = allStockList.size();

		// Java에서 페이징 처리
		Integer pageIndexValue = searchVO.getPageIndex();
		Integer pageSizeValue = searchVO.getPageSize();
		int pageIndex = pageIndexValue != null ? pageIndexValue : 1;
		int pageSize = pageSizeValue != null ? pageSizeValue : 10;
		
		// 시작 인덱스와 종료 인덱스 계산 (pageIndex는 1부터 시작)
		int startIndex = (pageIndex - 1) * pageSize;
		int endIndex = Math.min(startIndex + pageSize, totalCount);

		// 페이징된 리스트 추출 (시작 인덱스가 전체 건수보다 크면 빈 리스트 반환)
		List<StockInquiry> pagedList = startIndex >= totalCount 
			? new java.util.ArrayList<>() 
			: allStockList.subList(startIndex, endIndex);

		resultMap.put("resultList", pagedList);
		resultMap.put("totalCount", totalCount);
		resultMap.put("pageIndex", pageIndex);
		resultMap.put("pageSize", pageSize);

		return resultMap;
	}
}
