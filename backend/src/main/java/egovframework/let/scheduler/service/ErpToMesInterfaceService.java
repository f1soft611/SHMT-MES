package egovframework.let.scheduler.service;

/**
 * ERP-MES 인터페이스 서비스
 * 스케쥴러에서 주기적으로 ERP 시스템의 데이터를 MES 시스템으로 연동하는 서비스
 * 
 * @author SHMT-MES
 * @since 2025.10.23
 * @version 1.0
 * @see
 *
 * <pre>
 * << 개정이력(Modification Information) >>
 *
 *   수정일      수정자           수정내용
 *  -------    --------    ---------------------------
 *   2025.10.23 SHMT-MES          최초 생성
 *
 * </pre>
 */
public interface ErpToMesInterfaceService {

	/**
	 * ERP 시스템의 품목 정보를 MES 시스템으로 연동
	 * @throws Exception
	 */
	void syncMaterials() throws Exception;

	/**
	 * 스케쥴러에서 호출되는 품목정보 프로세스 실행
	 * @throws Exception
	 */
	void executeMaterialInterface() throws Exception;

	/**
	 * ERP 시스템의 사원 정보를 MES 시스템으로 연동
	 * ERP의 SHM_IF_VIEW_TDAEmp 뷰에서 사원 정보를 조회하여 MES_USER_INFO 테이블에 동기화
	 * @throws Exception
	 */
	void syncUsers() throws Exception;

	/**
	 * 스케쥴러에서 호출되는 거래처정보를 프로세스 실행
	 * @throws Exception
	 */
	void executeCustInterface() throws Exception;

	/**
	 * ERP 시스템의 거래처 정보를 MES 시스템으로 연동
	 * ERP의 SHM_IF_VIEW_TDACust 뷰에서 사원 정보를 조회하여 TCO601 테이블에 동기화
	 * @throws Exception
	 */
	void syncCusts() throws Exception;

	/**
	 * 스케쥴러에서 호출되는 사원정보 프로세스 실행
	 * @throws Exception
	 */
	void executeUserInterface() throws Exception;

	/**
	 * 스케쥴러에서 호출되는 모든 프로세스 실행
	 * @throws Exception
	 */
	void executeInterface() throws Exception;
}
