package egovframework.let.scheduler.service;

import egovframework.let.scheduler.domain.model.ErpTPDROUItemProcMat;

import java.util.List;

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
	 * ERP 시스템에서 특정 품목을 루트로 하위 자재까지 재귀적으로 제품별공정별소요자재 정보를 조회한다.
	 * TCO501에 쓰지 않고 조회만 한다 (저장은 호출부 책임).
	 * @param itemSeq 루트 품목의 ERP ItemSeq
	 * @return 루트 + 재귀적으로 발견된 하위 자재의 ERP 원본 데이터 전체
	 * @throws Exception
	 */
	List<ErpTPDROUItemProcMat> fetchTPDROUItemProcMatByItemSeq(int itemSeq) throws Exception;

	/**
	 * 루트 품목의 TCO501 BOM 트리를 삭제하고 ERP에서 재귀적으로 다시 가져와 저장한다.
	 * @param rootItemSeq 루트 품목의 ERP ItemSeq
	 * @throws Exception
	 */
	void resyncTPDROUItemProcMatByRootItem(int rootItemSeq) throws Exception;

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
	 * 조회 기준 날짜는 ERP 생산의뢰일(ReqDate, yyyyMMdd)
	 * @param fromDate 조회 시작 날짜 (yyyy-MM-dd)
	 * @param toDate 조회 종료 날짜 (yyyy-MM-dd)
	 * @throws Exception
	 */
	void syncProductionRequests(String fromDate, String toDate) throws Exception;

	/**
	 * 스케쥴러에서 호출되는 생산 의뢰 정보 프로세스 실행
	 * 조회 기간은 ERP 생산의뢰일(ReqDate) 기준
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
