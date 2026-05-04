package egovframework.let.production.wipInventory.service;

import egovframework.let.common.dto.ListResult;
import egovframework.let.production.wipInventory.domain.model.WipInventoryRow;
import egovframework.let.production.wipInventory.domain.model.WipInventorySearchDto;
import egovframework.let.production.wipInventory.domain.model.WipInventoryVO;

import java.util.List;
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
public interface EgovWipInventoryService {

	/**
	 * ERP 프로시저를 호출하여 재고 목록을 조회한다. (페이징 포함)
	 * @param searchVO 검색 조건
	 * @return 재고 목록과 총 건수
	 * @throws Exception
	 */
	ListResult<WipInventoryRow> selectWipInventoryList(WipInventorySearchDto searchVO) throws Exception;
}
