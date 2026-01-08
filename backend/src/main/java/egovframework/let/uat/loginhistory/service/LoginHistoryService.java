package egovframework.let.uat.loginhistory.service;

import egovframework.let.uat.loginhistory.domain.model.LoginHistory;
import egovframework.let.uat.loginhistory.domain.model.LoginHistoryVO;

import java.util.List;

/**
 * 로그인 이력 관리 서비스 인터페이스
 * @author SHMT-MES
 * @since 2026.01.08
 * @version 1.0
 * @see
 */
public interface LoginHistoryService {

	/**
	 * 로그인 이력을 등록한다.
	 * @param loginHistory 등록할 로그인 이력 정보
	 * @return 등록 결과
	 * @throws Exception
	 */
	int insertLoginHistory(LoginHistory loginHistory) throws Exception;

	/**
	 * 로그인 이력 목록을 조회한다.
	 * @param loginHistoryVO 검색 조건을 포함한 VO
	 * @return 로그인 이력 목록
	 * @throws Exception
	 */
	List<LoginHistoryVO> selectLoginHistoryList(LoginHistoryVO loginHistoryVO) throws Exception;

	/**
	 * 로그인 이력 전체 건수를 조회한다.
	 * @param loginHistoryVO 검색 조건을 포함한 VO
	 * @return 전체 건수
	 * @throws Exception
	 */
	int selectLoginHistoryListTotCnt(LoginHistoryVO loginHistoryVO) throws Exception;

	/**
	 * 로그인 이력 상세정보를 조회한다.
	 * @param loginHistoryId 로그인 이력 ID
	 * @return 로그인 이력 상세 정보
	 * @throws Exception
	 */
	LoginHistory selectLoginHistoryDetail(Long loginHistoryId) throws Exception;

	/**
	 * 로그아웃 정보를 업데이트한다.
	 * @param loginHistoryId 로그인 이력 ID
	 * @return 업데이트 결과
	 * @throws Exception
	 */
	int updateLogoutInfo(Long loginHistoryId) throws Exception;
}
