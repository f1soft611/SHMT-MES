package egovframework.let.production.order.service;

import egovframework.com.cmm.LoginVO;
import egovframework.let.cop.bbs.domain.model.Board;
import egovframework.let.cop.bbs.domain.model.BoardVO;
import egovframework.let.cop.bbs.dto.request.BbsManageDeleteBoardRequestDTO;
import egovframework.let.production.order.domain.model.ProductionOrderVO;

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
	 * 
	 * @param productionOrderVO
	 * @param attrbFlag
	 * @exception Exception Exception
	 */
	public Map<String, Object> selectProductionOrderList(ProductionOrderVO productionOrderVO, String attrbFlag)
	  throws Exception;

}