package egovframework.let.interfacelog.service.impl;

import egovframework.let.cop.bbs.domain.model.BoardVO;
import egovframework.let.interfacelog.domain.model.InterfaceLogVO;
import egovframework.let.interfacelog.domain.repository.InterfaceLogDAO;
import egovframework.let.interfacelog.service.EgovInterfaceLogService;
import egovframework.let.utl.fcc.service.EgovDateUtil;
import lombok.RequiredArgsConstructor;
import org.egovframe.rte.fdl.cmmn.EgovAbstractServiceImpl;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * 인터페이스 로그 관리를 위한 서비스 구현 클래스
 * @author 김기형
 * @since 2025.01.20
 * @version 1.0
 * @see
 *
 * <pre>
 * << 개정이력(Modification Information) >>
 *
 *   수정일      수정자           수정내용
 *  -------    --------    ---------------------------
 *   2025.01.20 AI Assistant     최초 생성
 *
 * </pre>
 */
@Service("EgovInterfaceLogService")
@RequiredArgsConstructor
public class EgovInterfaceLogServiceImpl extends EgovAbstractServiceImpl implements EgovInterfaceLogService {

	private final InterfaceLogDAO interfaceLogDAO;

	/**
	 * 조건에 맞는 인터페이스 로그 목록을 조회 한다.
	 *
	 * @see egovframework.let.interfacelog.service.EgovInterfaceLogService#selectInterfaceLogList(InterfaceLogVO)
	 */
	@Override
	public Map<String, Object> selectInterfaceLogList(InterfaceLogVO interfaceLogVO) throws Exception {

		List<InterfaceLogVO> list = interfaceLogDAO.selectInterfaceLogList(interfaceLogVO);
		List<InterfaceLogVO> result = new ArrayList<>();

		InterfaceLogVO vo;
		Iterator<InterfaceLogVO> iter = list.iterator();
		while (iter.hasNext()) {
			vo = iter.next();

			result.add(vo);
		}
		// 요구사항의 예시 데이터 추가
//		InterfaceLogVO log1 = new InterfaceLogVO();
//		log1.setLogNo(1L);
//		log1.setInterfaceName("ERP_TO_MES");
//		log1.setStartTime("20250805143400");
//		log1.setEndTime("20250805143400");
//		log1.setResultStatus("SUCCESS");
//		result.add(log1);
//
//		InterfaceLogVO log2 = new InterfaceLogVO();
//		log2.setLogNo(2L);
//		log2.setInterfaceName("ERP_TO_MES");
//		log2.setStartTime("20250805143500");
//		log2.setEndTime("20250805143500");
//		log2.setResultStatus("SUCCESS");
//		result.add(log2);
//
//		InterfaceLogVO log3 = new InterfaceLogVO();
//		log3.setLogNo(3L);
//		log3.setInterfaceName("ERP_TO_MES");
//		log3.setStartTime("20250805143600");
//		log3.setEndTime("20250805143600");
//		log3.setResultStatus("FAILED");
//		result.add(log3);

		int cnt = interfaceLogDAO.selectInterfaceLogListCnt(interfaceLogVO);

		Map<String, Object> map = new HashMap<String, Object>();

		map.put("resultList", result);
		map.put("resultCnt", Integer.toString(cnt));

		return map;
	}
}