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
	 * ERP 시스템의 작업지시 정보를 MES 시스템으로 연동
	 * @throws Exception
	 */
	void syncWorkOrders() throws Exception;

	/**
	 * ERP 시스템의 자재 정보를 MES 시스템으로 연동
	 * @throws Exception
	 */
	void syncMaterials() throws Exception;

	/**
	 * ERP 시스템의 BOM(Bill of Materials) 정보를 MES 시스템으로 연동
	 * @throws Exception
	 */
	void syncBom() throws Exception;

	/**
	 * 스케쥴러에서 호출되는 전체 연동 프로세스 실행
	 * @throws Exception
	 */
	void executeInterface() throws Exception;
}
