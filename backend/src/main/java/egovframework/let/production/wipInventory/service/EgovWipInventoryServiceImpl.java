package egovframework.let.production.wipInventory.service;

import egovframework.let.common.dto.ListResult;
import egovframework.let.production.wipInventory.domain.model.WipInventory;
import egovframework.let.production.wipInventory.domain.model.WipInventoryRow;
import egovframework.let.production.wipInventory.domain.model.WipInventorySearchDto;
import egovframework.let.production.wipInventory.domain.repository.WipInventoryDAO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;


import java.util.List;

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
@Service("EgovWipInventoryService")
@RequiredArgsConstructor
public class EgovWipInventoryServiceImpl implements EgovWipInventoryService {

	private final WipInventoryDAO  wipInventoryDAO;

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
	public ListResult<WipInventoryRow> selectWipInventoryList(WipInventorySearchDto searchVO) throws Exception {

		List<WipInventoryRow> list = wipInventoryDAO.selectWipInventoryList(searchVO);
		int resultCnt = wipInventoryDAO.selectWipInventoryListCount(searchVO);


		return new ListResult<>(list, resultCnt);
	}
}
