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
	 * ERP 시스템의 제품별공정별소요자재 정보를 MES 시스템으로 연동
	 * ERP의 SHM_IF_VIEW_TPDROUItemProcMat 뷰에서 정보를 조회하여 TCO501 테이블에 동기화
	 * @param fromDate 조회 시작 날짜 (yyyy-MM-dd)
	 * @param toDate 조회 종료 날짜 (yyyy-MM-dd)
	 * @throws Exception
	 */
	void syncTPDROUItemProcMat(String fromDate, String toDate) throws Exception;

	/**
	 * 스케쥴러에서 호출되는 제품별공정별소요자재 정보 프로세스 실행
	 * @param fromDate 조회 시작 날짜 (yyyy-MM-dd)
	 * @param toDate 조회 종료 날짜 (yyyy-MM-dd)
	 * @throws Exception
	 */
	void executeTPDROUItemProcMatInterface(String fromDate, String toDate) throws Exception;

	/**
	 * ERP 시스템의 품목 정보를 MES 시스템으로 연동
	 * ERP의 SHM_IF_VIEW_TDAItem 뷰에서 품목 정보를 조회하여 TCO403 테이블에 동기화
	 * @param fromDate 조회 시작 날짜 (yyyy-MM-dd)
	 * @param toDate 조회 종료 날짜 (yyyy-MM-dd)
	 * @throws Exception
	 */
	void syncItems(String fromDate, String toDate) throws Exception;

	/**
	 * 스케쥴러에서 호출되는 품목정보 프로세스 실행
	 * @param fromDate 조회 시작 날짜 (yyyy-MM-dd)
	 * @param toDate 조회 종료 날짜 (yyyy-MM-dd)
	 * @throws Exception
	 */
	void executeItemInterface(String fromDate, String toDate) throws Exception;

	/**
	 * ERP 시스템의 거래처 정보를 MES 시스템으로 연동
	 * ERP의 SHM_IF_VIEW_TDACust 뷰에서 사원 정보를 조회하여 TCO601 테이블에 동기화
	 * @param fromDate 조회 시작 날짜 (yyyy-MM-dd)
	 * @param toDate 조회 종료 날짜 (yyyy-MM-dd)
	 * @throws Exception
	 */
	void syncCusts(String fromDate, String toDate) throws Exception;

	/**
	 * 스케쥴러에서 호출되는 거래처정보를 프로세스 실행
	 * @param fromDate 조회 시작 날짜 (yyyy-MM-dd)
	 * @param toDate 조회 종료 날짜 (yyyy-MM-dd)
	 * @throws Exception
	 */
	void executeCustInterface(String fromDate, String toDate) throws Exception;

	/**
	 * ERP 시스템의 사원 정보를 MES 시스템으로 연동
	 * ERP의 SHM_IF_VIEW_TDAEmp 뷰에서 사원 정보를 조회하여 MES_USER_INFO 테이블에 동기화
	 * @param fromDate 조회 시작 날짜 (yyyy-MM-dd)
	 * @param toDate 조회 종료 날짜 (yyyy-MM-dd)
	 * @throws Exception
	 */
	void syncUsers(String fromDate, String toDate) throws Exception;

	/**
	 * 스케쥴러에서 호출되는 사원정보 프로세스 실행
	 * @param fromDate 조회 시작 날짜 (yyyy-MM-dd)
	 * @param toDate 조회 종료 날짜 (yyyy-MM-dd)
	 * @throws Exception
	 */
	void executeUserInterface(String fromDate, String toDate) throws Exception;

	/**
	 * ERP 시스템의 생산 의뢰 정보를 MES 시스템으로 연동
	 * ERP의 생산의뢰 테이블에서 생산 의뢰 정보를 조회하여 TSA308 테이블에 동기화
	 * @param fromDate 조회 시작 날짜 (yyyy-MM-dd)
	 * @param toDate 조회 종료 날짜 (yyyy-MM-dd)
	 * @throws Exception
	 */
	void syncProductionRequests(String fromDate, String toDate) throws Exception;

	/**
	 * 스케쥴러에서 호출되는 생산 의뢰 정보 프로세스 실행
	 * @param fromDate 조회 시작 날짜 (yyyy-MM-dd)
	 * @param toDate 조회 종료 날짜 (yyyy-MM-dd)
	 * @throws Exception
	 */
	void executeProdReqInterface(String fromDate, String toDate) throws Exception;

	/**
	 * ERP 시스템의 워크센터 정보를 MES 공통코드(COM010)로 연동
	 * ERP의 SHM_IF_VIEW_TPDBaseWorkCenter 뷰에서 워크센터 정보를 조회하여 공통코드 상세(COM010)에 동기화
	 * @param fromDate 조회 시작 날짜 (yyyy-MM-dd)
	 * @param toDate 조회 종료 날짜 (yyyy-MM-dd)
	 * @throws Exception
	 */
	void syncWorkCenters(String fromDate, String toDate) throws Exception;

	/**
	 * 스케쥴러에서 호출되는 워크센터 정보 프로세스 실행
	 * @param fromDate 조회 시작 날짜 (yyyy-MM-dd)
	 * @param toDate 조회 종료 날짜 (yyyy-MM-dd)
	 * @throws Exception
	 */
	void executeWorkCenterInterface(String fromDate, String toDate) throws Exception;

	/**
	 * 스케쥴러에서 호출되는 모든 프로세스 실행
	 * @param fromDate 조회 시작 날짜 (yyyy-MM-dd)
	 * @param toDate 조회 종료 날짜 (yyyy-MM-dd)
	 * @throws Exception
	 */
	void executeInterface(String fromDate, String toDate) throws Exception;
}
