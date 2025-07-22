package egovframework.let.production.order.service.impl;

import egovframework.com.cmm.LoginVO;
import egovframework.com.cmm.service.EgovFileMngService;
import egovframework.com.cmm.service.FileVO;
import egovframework.let.cop.bbs.domain.model.Board;
import egovframework.let.cop.bbs.domain.model.BoardVO;
import egovframework.let.cop.bbs.domain.repository.BBSManageDAO;
import egovframework.let.cop.bbs.dto.request.BbsManageDeleteBoardRequestDTO;
import egovframework.let.cop.bbs.service.EgovBBSManageService;
import egovframework.let.production.order.domain.model.ProductionOrderVO;
import egovframework.let.production.order.domain.repository.ProductionOrderDAO;
import egovframework.let.production.order.service.EgovProductionOrderService;
import egovframework.let.utl.fcc.service.EgovDateUtil;
import lombok.RequiredArgsConstructor;
import org.egovframe.rte.fdl.cmmn.EgovAbstractServiceImpl;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * 생산 지시 관리를 위한 서비스 구현 클래스
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
@Service("EgovProductionOrderService")
@RequiredArgsConstructor
public class EgovProductionOrderServiceImpl extends EgovAbstractServiceImpl implements EgovProductionOrderService {

	private final ProductionOrderDAO productionOrderDAO;

	/**
	 * 조건에 맞는 게시물 목록을 조회 한다.
	 *
	 * @see egovframework.let.production.order.service.EgovProductionOrderService#selectProductionOrderList(ProductionOrderVO, String) (ProductionOrderVO, String)
	 */
	@Override
	public Map<String, Object> selectProductionOrderList(ProductionOrderVO prdouctionOrderVO, String attrbFlag) throws Exception {

		List<PrdouctionOrderVO> list = productionOrderDAO.selectProductionOrderList(prdouctionOrderVO);
		List<PrdouctionOrderVO> result = new ArrayList<PrdouctionOrderVO>();
		if ("BBSA01".equals(attrbFlag)) {
			// 유효게시판 임
			String today = EgovDateUtil.getToday();

			BoardVO vo;
			Iterator<PrdouctionOrderVO> iter = list.iterator();
			while (iter.hasNext()) {
				vo = iter.next();

				if (!"".equals(vo.getNtceBgnde()) || !"".equals(vo.getNtceEndde())) {
					if (EgovDateUtil.getDaysDiff(today, vo.getNtceBgnde()) > 0
							|| EgovDateUtil.getDaysDiff(today, vo.getNtceEndde()) < 0) {
						// 시작일이 오늘날짜보다 크거나, 종료일이 오늘 날짜보다 작은 경우
						vo.setIsExpired("Y");
					}
				}
				result.add(vo);
			}
		} else {
			result = list;
		}

		int cnt = productionOrderDAO.selectProductionOrderList(prdouctionOrderVO);

		Map<String, Object> map = new HashMap<String, Object>();

		map.put("resultList", result);
		map.put("resultCnt", Integer.toString(cnt));

		return map;
	}

	@Override
	public Map<String, Object> selectProductionOrderList(PrdouctionOrderVO prdouctionOrderVO, String attrbFlag) throws Exception {
		return null;
	}
}
