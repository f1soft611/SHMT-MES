package egovframework.let.scheduler.service;

/**
 * ERP-MES 사원정보 인터페이스 서비스
 * 스케쥴러에서 주기적으로 ERP 시스템의 사원 데이터를 MES 시스템으로 연동하는 서비스
 * 
 * @author SHMT-MES
 * @since 2025.11.06
 * @version 1.0
 * @see
 *
 * <pre>
 * << 개정이력(Modification Information) >>
 *
 *   수정일      수정자           수정내용
 *  -------    --------    ---------------------------
 *   2025.11.06 SHMT-MES          최초 생성
 *
 * </pre>
 */
public interface ErpToMesUserInterfaceService {

	/**
	 * ERP 시스템의 사원 정보를 MES 시스템으로 연동
	 * ERP의 SHM_IF_VIEW_TDAEmp 뷰에서 사원 정보를 조회하여 MES_USER_INFO 테이블에 동기화
	 * @throws Exception
	 */
	void syncUsers() throws Exception;

	/**
	 * 스케쥴러에서 호출되는 사원 정보 연동 프로세스 실행
	 * @throws Exception
	 */
	void executeInterface() throws Exception;
}
