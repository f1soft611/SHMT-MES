package egovframework.let.interfacelog.service;

import egovframework.let.interfacelog.domain.model.InterfaceLogVO;

import java.util.Map;

/**
 * 인터페이스 로그를 관리하기 위한 서비스 인터페이스 클래스
 * @author AI Assistant
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
public interface EgovInterfaceLogService {

	/**
	 * 조건에 맞는 인터페이스 로그 목록을 조회 한다.
	 * @return
	 * 
	 * @param interfaceLogVO
	 * @exception Exception Exception
	 */
	public Map<String, Object> selectInterfaceLogList(InterfaceLogVO interfaceLogVO)
	  throws Exception;

}