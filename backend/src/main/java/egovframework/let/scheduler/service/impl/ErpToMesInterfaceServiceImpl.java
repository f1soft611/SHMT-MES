package egovframework.let.scheduler.service.impl;

import egovframework.let.scheduler.domain.model.ErpCustomer;
import egovframework.let.scheduler.domain.model.ErpEmployee;
import egovframework.let.scheduler.domain.model.ErpItem;
import egovframework.let.scheduler.domain.model.ErpProductionRequest;
import egovframework.let.scheduler.domain.model.ErpWorkCenter;
import egovframework.let.scheduler.domain.repository.MesCustInterfaceDAO;
import egovframework.let.scheduler.domain.repository.MesUserInterfaceDAO;
import egovframework.let.scheduler.domain.repository.MesItemInterfaceDAO;
import egovframework.let.scheduler.domain.repository.MesProdReqInterfaceDAO;
import egovframework.let.scheduler.service.ErpToMesInterfaceService;
import egovframework.let.utl.sim.service.EgovFileScrty;
import egovframework.let.basedata.commoncode.domain.model.CommonDetailCode;
import egovframework.let.basedata.commoncode.domain.repository.CommonDetailCodeDAO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

/**
 * ERP-MES 인터페이스 서비스 구현체
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
 *   2025.11.14 socra710          거래처 연동 기능 추가
 *
 * </pre>
 */
@Slf4j
@Service("erpToMesInterfaceService")
@RequiredArgsConstructor
public class ErpToMesInterfaceServiceImpl implements ErpToMesInterfaceService {

	@Autowired
	@Qualifier("erpJdbcTemplate")
	private JdbcTemplate erpJdbcTemplate;

	@Autowired
	private MesUserInterfaceDAO mesUserInterfaceDAO;
	@Autowired
	private MesCustInterfaceDAO mesCustInterfaceDAO;
	@Autowired
	private MesItemInterfaceDAO mesItemInterfaceDAO;
	@Autowired
	private MesProdReqInterfaceDAO mesProdReqInterfaceDAO;

		// MES 제품별공정별소요자재(TCO501) 인터페이스 DAO
		@Autowired
		private egovframework.let.scheduler.domain.repository.MesTPDROUItemProcMatInterfaceDAO mesTPDROUItemProcMatInterfaceDAO;
	
	// 공통코드 상세 DAO
	@Autowired
	private CommonDetailCodeDAO commonDetailCodeDAO;

	/**
	 * ERP 시스템의 사원 정보를 MES 시스템으로 연동
	 * @param fromDate 조회 시작 날짜 (yyyy-MM-dd)
	 * @param toDate 조회 종료 날짜 (yyyy-MM-dd)
	 */
	@Override
//	@Transactional
	public void syncUsers(String fromDate, String toDate) throws Exception {
		log.info("=== ERP 사원정보 연동 시작 ===");

		int insertCount = 0;
		int updateCount = 0;
		int errorCount = 0;
		Exception lastError = null;

		try {
			// 1. ERP 시스템에서 사원 정보 조회
			log.info("ERP 시스템(SHM_IF_VIEW_TDAEmp)에서 사원 데이터 조회 시작");
			List<ErpEmployee> erpEmployees = selectErpEmployees(fromDate, toDate);
			log.info("ERP 사원 데이터 조회 완료: {}건", erpEmployees.size());

			// 2. MES 시스템에 사원 정보 등록/업데이트
			for (ErpEmployee employee : erpEmployees) {
				try {
					// 2-1. MES에 해당 사원이 존재하는지 확인
					int count = mesUserInterfaceDAO.selectMesUserCount(employee.getEmpId());

					if (count == 0) {

						//패스워드 암호화
						String pass = EgovFileScrty.encryptPassword(employee.getPassword()+employee.getPassword(), employee.getEmpId());
						employee.setPassword(pass);

						// 2-2. 신규 사원인 경우 INSERT
						mesUserInterfaceDAO.insertMesUser(employee);
						insertCount++;
						log.debug("신규 사원 등록: {} ({})", employee.getEmpName(), employee.getEmpId());
					} else {
						// 2-3. 기존 사원인 경우 UPDATE
						mesUserInterfaceDAO.updateMesUser(employee);
						updateCount++;
						log.debug("기존 사원 업데이트: {} ({})", employee.getEmpName(), employee.getEmpId());
					}
				} catch (Exception e) {
					errorCount++;
					lastError = e;
					log.error("사원 정보 처리 실패: {} ({})", employee.getEmpName(), employee.getEmpId(), e);
				}
			}

			log.info("=== ERP 사원정보 연동 완료 ===");
			log.info("총 처리: {}건, 신규등록: {}건, 업데이트: {}건, 오류: {}건",
					erpEmployees.size(), insertCount, updateCount, errorCount);

			// 오류가 하나라도 있으면 예외를 던져서 스케쥴러 히스토리에 실패로 기록
			if (errorCount > 0 && lastError != null) {
				throw new Exception(String.format("사원정보 연동 중 오류 발생 - 총 처리: %d건, 성공: %d건, 실패: %d건. 마지막 오류: %s",
						erpEmployees.size(), insertCount + updateCount, errorCount, lastError.getMessage()), lastError);
			}

		} catch (Exception e) {
			log.error("사원정보 연동 실패", e);
			throw e;
		}
	}

	/**
	 * ERP에서 사원 정보 조회 (JdbcTemplate 사용)
	 * @param fromDate 조회 시작 날짜 (yyyy-MM-dd)
	 * @param toDate 조회 종료 날짜 (yyyy-MM-dd)
	 * @return 사원 정보 리스트
	 */
	private List<ErpEmployee> selectErpEmployees(String fromDate, String toDate) {
		String sql = "SELECT CompanySeq, EmpSeq, EmpId, EmpName, UMPgSeq, UMPgName, " +
				"DeptSeq, DeptName, TypeSeq, TypeName, Email, UserId, UserSeq, " +
				"LastUserSeq, LastDateTime " +
				"FROM SHM_IF_VIEW_TDAEmp " +
				"WHERE TypeSeq = 3031001 " +  // 재직자만 동기화
				"AND CONVERT(VARCHAR(10), LastDateTime, 120) BETWEEN ? AND ? " +  // 날짜 범위 필터
				"ORDER BY EmpSeq";

		return erpJdbcTemplate.query(sql, new ErpEmployeeRowMapper(), fromDate, toDate);
	}

	/**
	 * ERP 사원 데이터를 ErpEmployee 객체로 매핑하는 RowMapper
	 */
	private static class ErpEmployeeRowMapper implements RowMapper<ErpEmployee> {
		@Override
		public ErpEmployee mapRow(ResultSet rs, int rowNum) throws SQLException {
			ErpEmployee employee = new ErpEmployee();
			employee.setCompanySeq(rs.getInt("CompanySeq"));
			employee.setEmpSeq(rs.getInt("EmpSeq"));
			employee.setEmpId(rs.getString("EmpId"));
			employee.setEmpName(rs.getString("EmpName"));
			employee.setUmPgSeq(rs.getInt("UMPgSeq"));
			employee.setUmPgName(rs.getString("UMPgName"));
			employee.setDeptSeq(rs.getInt("DeptSeq"));
			employee.setDeptName(rs.getString("DeptName"));
			employee.setTypeSeq(rs.getInt("TypeSeq"));
			employee.setTypeName(rs.getString("TypeName"));
			employee.setEmail(rs.getString("Email"));
			employee.setUserId(rs.getString("UserId"));
			employee.setUserSeq(rs.getInt("UserSeq"));
			employee.setLastUserSeq(rs.getInt("LastUserSeq"));
			employee.setLastDateTime(rs.getTimestamp("LastDateTime"));

			employee.setPassword(rs.getString("EmpId"));
			return employee;
		}
	}

	/**
	 * 스케쥴러에서 호출되는 사원정보 프로세스 실행
	 * @param fromDate 조회 시작 날짜 (yyyy-MM-dd)
	 * @param toDate 조회 종료 날짜 (yyyy-MM-dd)
	 */
	@Override
	public void executeUserInterface(String fromDate, String toDate) throws Exception {
		log.info("╔══════════════════════════════════════╗");
		log.info("║  ERP-MES 인터페이스 연동 시작        ║");
		log.info("╚══════════════════════════════════════╝");

		long startTime = System.currentTimeMillis();

		try {
			// 사원 정보 연동 실행
			syncUsers(fromDate, toDate);

			long executionTime = System.currentTimeMillis() - startTime;
			log.info("╔══════════════════════════════════════╗");
			log.info("║  ERP-MES 인터페이스 연동 완료        ║");
			log.info("║  실행 시간: {}ms                 ║", executionTime);
			log.info("╚══════════════════════════════════════╝");

		} catch (Exception e) {
			long executionTime = System.currentTimeMillis() - startTime;
			log.error("╔══════════════════════════════════════╗");
			log.error("║  ERP-MES 인터페이스 연동 실패        ║");
			log.error("║  실행 시간: {}ms                 ║", executionTime);
			log.error("╚══════════════════════════════════════╝");
			throw e;
		}
	}

	/**
	 * ERP 시스템의 거래처 정보를 MES 시스템으로 연동
	 * @param fromDate 조회 시작 날짜 (yyyy-MM-dd)
	 * @param toDate 조회 종료 날짜 (yyyy-MM-dd)
	 */
	@Override
//	@Transactional
	public void syncCusts(String fromDate, String toDate) throws Exception {
		log.info("=== ERP 거래처정보 연동 시작 ===");

		int insertCount = 0;
		int updateCount = 0;
		int errorCount = 0;
		Exception lastError = null;

		try {
			// 1. ERP 시스템에서 거래처 정보 조회
			log.info("ERP 시스템(SHM_IF_VIEW_TDACust)에서 거래처 데이터 조회 시작");
			List<ErpCustomer> erpCustomers = selectErpCustomers(fromDate, toDate);
			log.info("ERP 거래처 데이터 조회 완료: {}건", erpCustomers.size());

			// 2. MES 시스템에 거래처 정보 등록/업데이트
			for (ErpCustomer customer : erpCustomers) {
				try {
					// 2-1. MES에 해당 거래처가 존재하는지 확인
					int count = mesCustInterfaceDAO.selectMesCustCount(customer.getCustSeq());

					if (count == 0) {
						// 2-2. 신규 거래처인 경우 INSERT
						mesCustInterfaceDAO.insertMesCust(customer);
						insertCount++;
						log.debug("신규 거래처 등록: {} ({})", customer.getCustName(), customer.getCustSeq());
					} else {
						// 2-3. 기존 거래처인 경우 UPDATE
						mesCustInterfaceDAO.updateMesCust(customer);
						updateCount++;
						log.debug("기존 거래처 업데이트: {} ({})", customer.getCustName(), customer.getCustSeq());
					}
				} catch (Exception e) {
					errorCount++;
					lastError = e;
					log.error("거래처 정보 처리 실패: {} ({})", customer.getCustName(), customer.getCustSeq(), e);
				}
			}

			log.info("=== ERP 거래처정보 연동 완료 ===");
			log.info("총 처리: {}건, 신규등록: {}건, 업데이트: {}건, 오류: {}건",
					erpCustomers.size(), insertCount, updateCount, errorCount);

			// 오류가 하나라도 있으면 예외를 던져서 스케쥴러 히스토리에 실패로 기록
			if (errorCount > 0 && lastError != null) {
				throw new Exception(String.format("거래처정보 연동 중 오류 발생 - 총 처리: %d건, 성공: %d건, 실패: %d건. 마지막 오류: %s",
						erpCustomers.size(), insertCount + updateCount, errorCount, lastError.getMessage()), lastError);
			}

		} catch (Exception e) {
			log.error("거래처정보 연동 실패", e);
			throw e;
		}
	}

	/**
	 * ERP에서 거래처 정보 조회 (JdbcTemplate 사용)
	 * @param fromDate 조회 시작 날짜 (yyyy-MM-dd)
	 * @param toDate 조회 종료 날짜 (yyyy-MM-dd)
	 * @return 거래처 정보 리스트
	 */
	private List<ErpCustomer> selectErpCustomers(String fromDate, String toDate) {
		String sql = "SELECT CompanySeq, CustSeq, CustName, SMCustStatus, SMCustStatusName, " +
				"SMDomFor, SMDomForName, BizNo, BizAddr, UMChannelSeq, UMChannelName, " +
				"ZipCode, CustKindName, LastUserSeq, LastDateTime " +
				"FROM SHM_IF_VIEW_TDACust " +
				"WHERE SMCustStatus = '2004001' " +  // 정상 거래처만 동기화 (필요시 조건 수정)
				"AND CustKindName IN ('국내매출거래처', '수출거래처') " +
				"AND CONVERT(VARCHAR(10), LastDateTime, 120) BETWEEN ? AND ? " +  // 날짜 범위 필터
				"ORDER BY CustSeq";

		return erpJdbcTemplate.query(sql, new ErpCustomerRowMapper(), fromDate, toDate);
	}

	/**
	 * ERP 거래처 데이터를 ErpCustomer 객체로 매핑하는 RowMapper
	 */
	private static class ErpCustomerRowMapper implements RowMapper<ErpCustomer> {
		@Override
		public ErpCustomer mapRow(ResultSet rs, int rowNum) throws SQLException {
			ErpCustomer customer = new ErpCustomer();
			customer.setCompanySeq(rs.getInt("CompanySeq"));
			customer.setCustSeq(rs.getInt("CustSeq"));
			customer.setCustName(rs.getString("CustName"));
			customer.setSmCustStatus(rs.getInt("SMCustStatus"));
			customer.setSmCustStatusName(rs.getString("SMCustStatusName"));
			customer.setSmDomFor(rs.getInt("SMDomFor"));
			customer.setSmDomForName(rs.getString("SMDomForName"));
			customer.setBizNo(rs.getString("BizNo"));
			customer.setBizAddr(rs.getString("BizAddr"));
			customer.setUmChannelSeq(rs.getInt("UMChannelSeq"));
			customer.setUmChannelName(rs.getString("UMChannelName"));
			customer.setZipCode(rs.getString("ZipCode"));
			customer.setCustKindName(rs.getString("CustKindName"));
			customer.setLastUserSeq(rs.getInt("LastUserSeq"));
			customer.setLastDateTime(rs.getTimestamp("LastDateTime"));
			return customer;
		}
	}

	/**
	 * 스케쥴러에서 호출되는 거래처정보 프로세스 실행
	 * @param fromDate 조회 시작 날짜 (yyyy-MM-dd)
	 * @param toDate 조회 종료 날짜 (yyyy-MM-dd)
	 */
	@Override
	public void executeCustInterface(String fromDate, String toDate) throws Exception {
		log.info("╔══════════════════════════════════════╗");
		log.info("║  ERP-MES 거래처 연동 시작            ║");
		log.info("╚══════════════════════════════════════╝");

		long startTime = System.currentTimeMillis();

		try {
			// 거래처 정보 연동 실행
			syncCusts(fromDate, toDate);

			long executionTime = System.currentTimeMillis() - startTime;
			log.info("╔══════════════════════════════════════╗");
			log.info("║  ERP-MES 거래처 연동 완료            ║");
			log.info("║  실행 시간: {}ms                 ║", executionTime);
			log.info("╚══════════════════════════════════════╝");

		} catch (Exception e) {
			long executionTime = System.currentTimeMillis() - startTime;
			log.error("╔══════════════════════════════════════╗");
			log.error("║  ERP-MES 거래처 연동 실패            ║");
			log.error("║  실행 시간: {}ms                 ║", executionTime);
			log.error("╚══════════════════════════════════════╝");
			throw e;
		}
	}

	/**
	 * ERP 시스템의 생산 의뢰 정보를 MES 시스템으로 연동
	 * @param fromDate 조회 시작 날짜 (yyyy-MM-dd)
	 * @param toDate 조회 종료 날짜 (yyyy-MM-dd)
	 */
	@Override
//	@Transactional
	public void syncProductionRequests(String fromDate, String toDate) throws Exception {
		log.info("=== ERP 생산 의뢰 정보 연동 시작 (기간: {} ~ {}) ===", fromDate, toDate);

		int insertCount = 0;
		int updateCount = 0;
		int errorCount = 0;
		Exception lastError = null;

		try {
			// 1. ERP 시스템에서 생산 의뢰 정보 조회
			log.info("ERP 시스템에서 생산 의뢰 데이터 조회 시작");
			List<ErpProductionRequest> erpProdReqs = selectErpProductionRequests(fromDate, toDate, fromDate, toDate);
			log.info("ERP 생산 의뢰 데이터 조회 완료: {}건", erpProdReqs.size());

			// 2. MES 시스템에 생산 의뢰 정보 등록/업데이트
			for (ErpProductionRequest prodReq : erpProdReqs) {
				try {
					// 2-1. MES에 해당 생산 의뢰가 존재하는지 확인
					int count = mesProdReqInterfaceDAO.selectMesProdReqCount(prodReq);

					if (count == 0) {
						// 2-2. 신규 생산 의뢰인 경우 INSERT
						mesProdReqInterfaceDAO.insertMesProdReq(prodReq);
						insertCount++;
						log.debug("신규 생산 의뢰 등록: {} ({})", prodReq.getProdReqNo(), prodReq.getProdReqSeq());
					} else {
						// 2-3. 기존 생산 의뢰인 경우 UPDATE
						mesProdReqInterfaceDAO.updateMesProdReq(prodReq);
						updateCount++;
						log.debug("기존 생산 의뢰 업데이트: {} ({})", prodReq.getProdReqNo(), prodReq.getProdReqSeq());
					}
				} catch (Exception e) {
					errorCount++;
					lastError = e;
					log.error("생산 의뢰 정보 처리 실패: {} ({})", prodReq.getProdReqNo(), prodReq.getProdReqSeq(), e);
				}
			}

			log.info("=== ERP 생산 의뢰 정보 연동 완료 ===");
			log.info("총 처리: {}건, 신규등록: {}건, 업데이트: {}건, 오류: {}건",
					erpProdReqs.size(), insertCount, updateCount, errorCount);

			// 오류가 하나라도 있으면 예외를 던져서 스케쥴러 히스토리에 실패로 기록
			if (errorCount > 0 && lastError != null) {
				throw new Exception(String.format("생산 의뢰 정보 연동 중 오류 발생 - 총 처리: %d건, 성공: %d건, 실패: %d건. 마지막 오류: %s",
						erpProdReqs.size(), insertCount + updateCount, errorCount, lastError.getMessage()), lastError);
			}

		} catch (Exception e) {
			log.error("생산 의뢰 정보 연동 실패", e);
			throw e;
		}
	}

	/**
	 * ERP에서 생산 의뢰 정보 조회 (JdbcTemplate 사용)
	 * @param fromDate 조회 시작 날짜 (yyyy-MM-dd)
	 * @param toDate 조회 종료 날짜 (yyyy-MM-dd)
	 * @return 생산 의뢰 정보 리스트
	 */
	private List<ErpProductionRequest> selectErpProductionRequests(String fromDate, String toDate, String fromDate2, String toDate2) {
		String sql =
				"SELECT " +
						"      JoinItem.ProdReqNo, " +
						"      JoinItem.ProdReqSeq, " +
						"      JoinItem.Serl, " +
						"      JoinItem.ReqDate, " +
						"      JoinItem.CustSeq, " +
						"      JoinItem.DeptSeq, " +
						"      JoinItem.EmpSeq, " +
						"      JoinItem.ItemSeq AS ItemSeq, " +
						"      JoinItem.ItemNo AS ItemNo, " +
						"      JoinItem.ItemName AS ItemName, " +
						"      JoinItem.Spec AS Spec, " +
						"      JoinItem.UnitSeq, " +
						"      JoinItem.Qty, " +
						"      JoinItem.EndDate, " +
						"      JoinItem.DelvDate, " +
						"      JoinItem.LastUserSeq, " +
						"      JoinItem.LastDateTime, " +

						// Join 된 Item (제품/반제품 둘 다)
						"      JoinItem.JoinItemSeq AS semiItemSeq, " +
						"      JoinItem.JoinItemNo AS semiItemNo, " +
						"      JoinItem.JoinItemName AS semiItemName, " +
						"      JoinItem.JoinSpec AS semiSpec, " +
						"      JoinItem.ItemFlag " +

						"FROM ( " +
						"      SELECT " +
						"           PRI.ProdReqNo, " +
						"           PRI.ProdReqSeq, " +
						"           PRI.Serl, " +
						"           PRI.ReqDate, " +
						"           PRI.CustSeq, " +
						"           PRI.DeptSeq, " +
						"           PRI.EmpSeq, " +
						"           PRI.ItemSeq, " +
						"           PRI.ItemNo, " +
						"           PRI.ItemName, " +
						"           PRI.Spec, " +
						"           PRI.UnitSeq, " +
						"           PRI.Qty, " +
						"           PRI.EndDate, " +
						"           PRI.DelvDate, " +
						"           PRI.LastUserSeq, " +
						"           PRI.LastDateTime, " +
						"           PRI.ItemSeq AS JoinItemSeq, " +
						"           PRI.ItemNo AS JoinItemNo, " +
						"           PRI.ItemName AS JoinItemName, " +
						"           PRI.Spec AS JoinSpec, " +
						"           2 AS ItemFlag " +
						"      FROM SHM_IF_VIEW_TPDMPSProdReqItem PRI " +
						"      WHERE CONVERT(VARCHAR(10), PRI.LastDateTime, 120) BETWEEN ? AND ? " +

						"      UNION ALL " +

						"      SELECT " +
						"           PRI.ProdReqNo, " +
						"           PRI.ProdReqSeq, " +
						"           PRI.Serl, " +
						"           PRI.ReqDate, " +
						"           PRI.CustSeq, " +
						"           PRI.DeptSeq, " +
						"           PRI.EmpSeq, " +
						"           PRI.ItemSeq, " +
						"           PRI.ItemNo, " +
						"           PRI.ItemName, " +
						"           PRI.Spec, " +
						"           PRI.UnitSeq, " +
						"           PRI.Qty, " +
						"           PRI.EndDate, " +
						"           PRI.DelvDate, " +
						"           PRI.LastUserSeq, " +
						"           PRI.LastDateTime, " +
						"           C.ItemSeq AS JoinItemSeq, " +
						"           C.ItemNo AS JoinItemNo, " +
						"           C.ItemName AS JoinItemName, " +
						"           C.Spec AS JoinSpec, " +
						"           4 AS ItemFlag " +
						"      FROM SHM_IF_VIEW_TPDMPSProdReqItem PRI " +
						"      INNER JOIN SHM_IF_VIEW_TPDROUItemProcMat A " +
						"             ON PRI.ItemSeq = A.UpperItemSeq " +
						"      INNER JOIN SHM_IF_VIEW_TDAItem C " +
						"             ON A.MatItemSeq = C.ItemSeq " +
						"            AND C.ASSETSEQ = '4' " +
						"      WHERE CONVERT(VARCHAR(10), PRI.LastDateTime, 120) BETWEEN ? AND ? " +
						"     ) AS JoinItem " +

						"ORDER BY ProdReqNo, ProdReqSeq, Serl, ItemFlag";



		return erpJdbcTemplate.query(sql, new ErpProductionRequestRowMapper(), fromDate, toDate, fromDate2, toDate2);
	}

	/**
	 * ERP 생산 의뢰 데이터를 ErpProductionRequest 객체로 매핑하는 RowMapper
	 */
	private static class ErpProductionRequestRowMapper implements RowMapper<ErpProductionRequest> {
		@Override
		public ErpProductionRequest mapRow(ResultSet rs, int rowNum) throws SQLException {
			ErpProductionRequest prodReq = new ErpProductionRequest();
			prodReq.setProdReqNo(rs.getString("ProdReqNo"));
			prodReq.setProdReqSeq(rs.getInt("ProdReqSeq"));
			prodReq.setSerl(rs.getInt("Serl"));
			prodReq.setReqDate(rs.getString("ReqDate"));
			prodReq.setCustSeq(rs.getInt("CustSeq"));
			prodReq.setDeptSeq(rs.getInt("DeptSeq"));
			prodReq.setEmpSeq(rs.getInt("EmpSeq"));
			prodReq.setItemSeq(rs.getInt("ItemSeq"));
			prodReq.setItemNo(rs.getString("ItemNo"));
			prodReq.setItemName(rs.getString("ItemName"));
			prodReq.setSpec(rs.getString("Spec"));
			prodReq.setUnitSeq(rs.getInt("UnitSeq"));
			prodReq.setQty(rs.getBigDecimal("Qty"));
			prodReq.setEndDate(rs.getString("EndDate"));
			prodReq.setDelvDate(rs.getString("DelvDate"));
			prodReq.setLastUserSeq(rs.getInt("LastUserSeq"));
			prodReq.setLastDateTime(rs.getTimestamp("LastDateTime"));

			// 반제품 정보 매핑
			prodReq.setSemiItemSeq(rs.getObject("SemiItemSeq") != null ? rs.getInt("SemiItemSeq") : null);
			prodReq.setSemiItemNo(rs.getString("SemiItemNo"));
			prodReq.setSemiItemName(rs.getString("SemiItemName"));
			prodReq.setSemiSpec(rs.getString("SemiSpec"));
			prodReq.setItemFlag(rs.getInt("ItemFlag"));

			return prodReq;
		}
	}

	/**
	 * 스케쥴러에서 호출되는 생산 의뢰 정보 프로세스 실행
	 * @param fromDate 조회 시작 날짜 (yyyy-MM-dd)
	 * @param toDate 조회 종료 날짜 (yyyy-MM-dd)
	 */
	@Override
	public void executeProdReqInterface(String fromDate, String toDate) throws Exception {
		log.info("╔══════════════════════════════════════╗");
		log.info("║  ERP-MES 생산 의뢰 연동 시작         ║");
		log.info("╚══════════════════════════════════════╝");

		long startTime = System.currentTimeMillis();

		try {
			// 생산 의뢰 정보 연동 실행
			syncProductionRequests(fromDate, toDate);

			long executionTime = System.currentTimeMillis() - startTime;
			log.info("╔══════════════════════════════════════╗");
			log.info("║  ERP-MES 생산 의뢰 연동 완료         ║");
			log.info("║  실행 시간: {}ms                 ║", executionTime);
			log.info("╚══════════════════════════════════════╝");

		} catch (Exception e) {
			long executionTime = System.currentTimeMillis() - startTime;
			log.error("╔══════════════════════════════════════╗");
			log.error("║  ERP-MES 생산 의뢰 연동 실패         ║");
			log.error("║  실행 시간: {}ms                 ║", executionTime);
			log.error("╚══════════════════════════════════════╝");
			throw e;
		}
	}

	/**
	 * ERP 시스템의 품목 정보를 MES 시스템으로 연동
	 * @param fromDate 조회 시작 날짜 (yyyy-MM-dd)
	 * @param toDate 조회 종료 날짜 (yyyy-MM-dd)
	 */
	@Override
//	@Transactional
	public void syncItems(String fromDate, String toDate) throws Exception {
		log.info("=== ERP 품목정보 연동 시작 (기간: {} ~ {}) ===", fromDate, toDate);

		int insertCount = 0;
		int updateCount = 0;
		int errorCount = 0;
		Exception lastError = null;

		try {
			// 1. ERP 시스템에서 품목 정보 조회
			log.info("ERP 시스템(SHM_IF_VIEW_TDAItem)에서 품목 데이터 조회 시작");
			List<ErpItem> erpItems = selectErpItems(fromDate, toDate);
			log.info("ERP 품목 데이터 조회 완료: {}건", erpItems.size());

			// 2. MES 시스템에 품목 정보 등록/업데이트
			for (ErpItem item : erpItems) {
				try {
					// 2-1. MES에 해당 품목이 존재하는지 확인
					int count = mesItemInterfaceDAO.selectMesItemCount(item);

					if (count == 0) {
						// 2-2. 신규 품목인 경우 INSERT
						mesItemInterfaceDAO.insertMesItem(item);
						insertCount++;
						log.debug("신규 품목 등록: {} ({})", item.getItemName(), item.getItemSeq());
					} else {
						// 2-3. 기존 품목인 경우 UPDATE
						mesItemInterfaceDAO.updateMesItem(item);
						updateCount++;
						log.debug("기존 품목 업데이트: {} ({})", item.getItemName(), item.getItemSeq());
					}
				} catch (Exception e) {
					errorCount++;
					lastError = e;
					log.error("품목 정보 처리 실패: {} ({})", item.getItemName(), item.getItemSeq(), e);
				}
			}

			log.info("=== ERP 품목정보 연동 완료 ===");
			log.info("총 처리: {}건, 신규등록: {}건, 업데이트: {}건, 오류: {}건",
					erpItems.size(), insertCount, updateCount, errorCount);

			// 오류가 하나라도 있으면 예외를 던져서 스케쥴러 히스토리에 실패로 기록
			if (errorCount > 0 && lastError != null) {
				throw new Exception(String.format("품목정보 연동 중 오류 발생 - 총 처리: %d건, 성공: %d건, 실패: %d건. 마지막 오류: %s",
						erpItems.size(), insertCount + updateCount, errorCount, lastError.getMessage()), lastError);
			}

		} catch (Exception e) {
			log.error("품목정보 연동 실패", e);
			throw e;
		}
	}

	/**
	 * ERP에서 품목 정보 조회 (JdbcTemplate 사용)
	 * @param fromDate 조회 시작 날짜 (yyyy-MM-dd)
	 * @param toDate 조회 종료 날짜 (yyyy-MM-dd)
	 * @return 품목 정보 리스트
	 */
	private List<ErpItem> selectErpItems(String fromDate, String toDate) {
		String sql = "SELECT CompanySeq, ItemNo, ItemSeq, ItemName, Spec, " +
				"UnitSeq, UnitName, AssetSeq, AssetName, LastUserSeq, LastDateTime " +
				"FROM SHM_IF_VIEW_TDAItem " +
				"WHERE CONVERT(VARCHAR(10), LastDateTime, 120) BETWEEN ? AND ? " +  // 날짜 범위 필터
				"ORDER BY ItemSeq";

		return erpJdbcTemplate.query(sql, new ErpItemRowMapper(), fromDate, toDate);
	}

	/**
	 * ERP 품목 데이터를 ErpItem 객체로 매핑하는 RowMapper
	 */
	private static class ErpItemRowMapper implements RowMapper<ErpItem> {
		@Override
		public ErpItem mapRow(ResultSet rs, int rowNum) throws SQLException {
			ErpItem item = new ErpItem();
			item.setCompanySeq(rs.getInt("CompanySeq"));
			item.setItemNo(rs.getString("ItemNo"));
			item.setItemSeq(rs.getString("ItemSeq"));
			item.setItemName(rs.getString("ItemName"));
			item.setSpec(rs.getString("Spec"));
			item.setUnitSeq(rs.getInt("UnitSeq"));
			item.setUnitName(rs.getString("UnitName"));
			item.setAssetSeq(rs.getInt("AssetSeq"));
			item.setAssetName(rs.getString("AssetName"));
			item.setLastUserSeq(rs.getInt("LastUserSeq"));
			item.setLastDateTime(rs.getTimestamp("LastDateTime"));
			return item;
		}
	}

	/**
	 * 스케쥴러에서 호출되는 품목정보 프로세스 실행
	 * @param fromDate 조회 시작 날짜 (yyyy-MM-dd)
	 * @param toDate 조회 종료 날짜 (yyyy-MM-dd)
	 */
	@Override
	public void executeItemInterface(String fromDate, String toDate) throws Exception {
		log.info("╔══════════════════════════════════════╗");
		log.info("║  ERP-MES 품목 연동 시작              ║");
		log.info("╚══════════════════════════════════════╝");

		long startTime = System.currentTimeMillis();

		try {
			// 품목 정보 연동 실행
			syncItems(fromDate, toDate);

			long executionTime = System.currentTimeMillis() - startTime;
			log.info("╔══════════════════════════════════════╗");
			log.info("║  ERP-MES 품목 연동 완료              ║");
			log.info("║  실행 시간: {}ms                 ║", executionTime);
			log.info("╚══════════════════════════════════════╝");

		} catch (Exception e) {
			long executionTime = System.currentTimeMillis() - startTime;
			log.error("╔══════════════════════════════════════╗");
			log.error("║  ERP-MES 품목 연동 실패              ║");
			log.error("║  실행 시간: {}ms                 ║", executionTime);
			log.error("╚══════════════════════════════════════╝");
			throw e;
		}
	}

	/**
	 * 스케쥴러에서 호출되는 전체 인터페이스 프로세스 실행
	 * 품목, 사원, 거래처, 생산 의뢰 순서로 연동 수행
	 * @param fromDate 조회 시작 날짜 (yyyy-MM-dd)
	 * @param toDate 조회 종료 날짜 (yyyy-MM-dd)
	 */
	@Override
	public void executeInterface(String fromDate, String toDate) throws Exception {
		log.info("╔══════════════════════════════════════╗");
		log.info("║  ERP-MES 인터페이스 연동 시작        ║");
		log.info("╚══════════════════════════════════════╝");

		long startTime = System.currentTimeMillis();

		try {
			// 품목 정보 연동 실행
			syncItems(fromDate, toDate);

			// 사원 정보 연동 실행
			syncUsers(fromDate, toDate);

			// 거래처 정보 연동 실행
			syncCusts(fromDate, toDate);

			// 생산 의뢰 정보 연동 실행
			syncProductionRequests(fromDate, toDate);

			long executionTime = System.currentTimeMillis() - startTime;
			log.info("╔══════════════════════════════════════╗");
			log.info("║  ERP-MES 인터페이스 연동 완료        ║");
			log.info("║  실행 시간: {}ms                 ║", executionTime);
			log.info("╚══════════════════════════════════════╝");

		} catch (Exception e) {
			long executionTime = System.currentTimeMillis() - startTime;
			log.error("╔══════════════════════════════════════╗");
			log.error("║  ERP-MES 인터페이스 연동 실패        ║");
			log.error("║  실행 시간: {}ms                 ║", executionTime);
			log.error("╚══════════════════════════════════════╝");
			throw e;
		}
	}

	/**
	 * ERP 시스템의 제품별공정별소요자재 정보를 MES 시스템으로 연동
	 * ERP의 SHM_IF_VIEW_TPDROUItemProcMat 뷰에서 정보를 조회하여 TCO501 테이블에 동기화
	 * @param fromDate 조회 시작 날짜 (yyyy-MM-dd)
	 * @param toDate 조회 종료 날짜 (yyyy-MM-dd)
	 */
	@Override
	public void syncTPDROUItemProcMat(String fromDate, String toDate) throws Exception {
		log.info("=== ERP 제품별공정별소요자재 연동 시작 ===");

		int insertCount = 0;
		int updateCount = 0;
		int errorCount = 0;
		Exception lastError = null;

		try {
			// 1. ERP 시스템에서 제품별공정별소요자재 정보 조회
			log.info("ERP 시스템(SHM_IF_VIEW_TPDROUItemProcMat)에서 제품별공정별소요자재 데이터 조회 시작");
			String sql = "SELECT CompanySeq, ItemSeq, BOMRev, ProcRev, ProcSeq, Serl, " +
					"MatItemSeq, UnitSeq, NeedQtyNumerator, NeedQtyDenominator, " +
					"SMDelvType, UpperItemSeq, UpperBOMRev, BOMItemSerl, " +
					"LastUserSeq, LastDateTime " +
					"FROM SHM_IF_VIEW_TPDROUItemProcMat " +
					"WHERE CONVERT(VARCHAR(10), LastDateTime, 120) BETWEEN ? AND ? " +
					"ORDER BY CompanySeq, ItemSeq, ProcSeq, Serl";

			List<egovframework.let.scheduler.domain.model.ErpTPDROUItemProcMat> erpList =
					erpJdbcTemplate.query(sql, new ErpTPDROUItemProcMatRowMapper(), fromDate, toDate);
			log.info("ERP 제품별공정별소요자재 데이터 조회 완료: {}건", erpList.size());

			// 2. MES 시스템에 제품별공정별소요자재 정보 등록/업데이트
			for (egovframework.let.scheduler.domain.model.ErpTPDROUItemProcMat item : erpList) {
				try {
					// 2-1. 파라미터 Map 생성
					java.util.Map<String, Object> param = new java.util.HashMap<>();
					param.put("CompanySeq", item.getCompanySeq());
					param.put("ItemSeq", item.getItemSeq());
					param.put("BOMRev", item.getBOMRev());
					param.put("ProcRev", item.getProcRev());
					param.put("ProcSeq", item.getProcSeq());
					param.put("Serl", item.getSerl());
					param.put("MatItemSeq", item.getMatItemSeq());
					param.put("UnitSeq", item.getUnitSeq());
					param.put("NeedQtyNumerator", item.getNeedQtyNumerator());
					param.put("NeedQtyDenominator", item.getNeedQtyDenominator());
					param.put("SMDelvType", item.getSMDelvType());
					param.put("UpperItemSeq", item.getUpperItemSeq());
					param.put("UpperBOMRev", item.getUpperBOMRev());
					param.put("BOMItemSerl", item.getBOMItemSerl());
					param.put("LastUserSeq", item.getLastUserSeq());
					param.put("LastDateTime", item.getLastDateTime());

					// 2-2. MES에 해당 제품별공정별소요자재가 존재하는지 확인
					int count = mesTPDROUItemProcMatInterfaceDAO.selectMesTPDROUItemProcMatCount(param);

					if (count == 0) {
						// 2-3. 신규인 경우 INSERT
						mesTPDROUItemProcMatInterfaceDAO.insertMesTPDROUItemProcMat(param);
						insertCount++;
						log.debug("신규 제품별공정별소요자재 등록: 품목코드={}, 공정코드={}, 순번={}",
								item.getItemSeq(), item.getProcSeq(), item.getSerl());
					} else {
						// 2-4. 기존인 경우 UPDATE
						mesTPDROUItemProcMatInterfaceDAO.updateMesTPDROUItemProcMat(param);
						updateCount++;
						log.debug("기존 제품별공정별소요자재 업데이트: 품목코드={}, 공정코드={}, 순번={}",
								item.getItemSeq(), item.getProcSeq(), item.getSerl());
					}
				} catch (Exception e) {
					errorCount++;
					lastError = e;
					log.error("제품별공정별소요자재 정보 처리 실패: 품목코드={}, 공정코드={}, 순번={}",
							item.getItemSeq(), item.getProcSeq(), item.getSerl(), e);
				}
			}

			log.info("=== ERP 제품별공정별소요자재 연동 완료 ===");
			log.info("총 처리: {}건, 신규등록: {}건, 업데이트: {}건, 오류: {}건",
					erpList.size(), insertCount, updateCount, errorCount);

			// 오류가 하나라도 있으면 예외를 던져서 스케쥴러 히스토리에 실패로 기록
			if (errorCount > 0 && lastError != null) {
				throw new Exception(String.format("제품별공정별소요자재 연동 중 오류 발생 - 총 처리: %d건, 성공: %d건, 실패: %d건. 마지막 오류: %s",
						erpList.size(), insertCount + updateCount, errorCount, lastError.getMessage()), lastError);
			}

		} catch (Exception e) {
			log.error("제품별공정별소요자재 연동 실패", e);
			throw e;
		}
	}

	/**
	 * 스케쥴러에서 호출되는 제품별공정별소요자재 정보 프로세스 실행
	 * @param fromDate 조회 시작 날짜 (yyyy-MM-dd)
	 * @param toDate 조회 종료 날짜 (yyyy-MM-dd)
	 */
	@Override
	public void executeTPDROUItemProcMatInterface(String fromDate, String toDate) throws Exception {
		log.info("╔══════════════════════════════════════╗");
		log.info("║  ERP-MES 제품별공정별소요자재 연동 시작 ║");
		log.info("╚══════════════════════════════════════╝");
		long startTime = System.currentTimeMillis();

		try {
			syncTPDROUItemProcMat(fromDate, toDate);

			long executionTime = System.currentTimeMillis() - startTime;
			log.info("╔══════════════════════════════════════╗");
			log.info("║  ERP-MES 제품별공정별소요자재 연동 완료 ║");
			log.info("║  실행 시간: {}ms                 ║", executionTime);
			log.info("╚══════════════════════════════════════╝");

		} catch (Exception e) {
			long executionTime = System.currentTimeMillis() - startTime;
			log.error("╔══════════════════════════════════════╗");
			log.error("║  ERP-MES 제품별공정별소요자재 연동 실패 ║");
			log.error("║  실행 시간: {}ms                 ║", executionTime);
			log.error("╚══════════════════════════════════════╝");
			throw e;
		}
	}

	/**
	 * ERP 제품별공정별소요자재 RowMapper
	 */
	private static class ErpTPDROUItemProcMatRowMapper implements RowMapper<egovframework.let.scheduler.domain.model.ErpTPDROUItemProcMat> {
		@Override
		public egovframework.let.scheduler.domain.model.ErpTPDROUItemProcMat mapRow(ResultSet rs, int rowNum) throws SQLException {
			egovframework.let.scheduler.domain.model.ErpTPDROUItemProcMat item =
					new egovframework.let.scheduler.domain.model.ErpTPDROUItemProcMat();
			item.setCompanySeq(rs.getInt("CompanySeq"));
			item.setItemSeq(rs.getInt("ItemSeq"));
			item.setBOMRev(rs.getString("BOMRev"));
			item.setProcRev(rs.getString("ProcRev"));
			item.setProcSeq(rs.getInt("ProcSeq"));
			item.setSerl(rs.getInt("Serl"));
			item.setMatItemSeq(rs.getInt("MatItemSeq"));
			item.setUnitSeq(rs.getInt("UnitSeq"));
			item.setNeedQtyNumerator(rs.getBigDecimal("NeedQtyNumerator"));
			item.setNeedQtyDenominator(rs.getBigDecimal("NeedQtyDenominator"));
			item.setSMDelvType(rs.getInt("SMDelvType"));
			item.setUpperItemSeq(rs.getInt("UpperItemSeq"));
			item.setUpperBOMRev(rs.getString("UpperBOMRev"));
			item.setBOMItemSerl(rs.getInt("BOMItemSerl"));
			item.setLastUserSeq(rs.getInt("LastUserSeq"));
			item.setLastDateTime(rs.getTimestamp("LastDateTime"));
			return item;
		}
	}

	/**
	 * ERP 시스템의 워크센터 정보를 MES 공통코드(COM010)으로 연동
	 * @param fromDate 조회 시작 날짜 (yyyy-MM-dd)
	 * @param toDate 조회 종료 날짜 (yyyy-MM-dd)
	 */
	@Override
	public void syncWorkCenters(String fromDate, String toDate) throws Exception {
		log.info("=== ERP 워크센터 정보 연동 시작 ===");

		int insertCount = 0;
		int updateCount = 0;
		int errorCount = 0;
		Exception lastError = null;

		try {
			// 1. ERP 시스템에서 워크센터 정보 조회
			log.info("ERP 시스템(SHM_IF_VIEW_TPDBaseWorkCenter)에서 워크센터 데이터 조회 시작");
			List<ErpWorkCenter> erpWorkCenters = selectErpWorkCenters(fromDate, toDate);
			log.info("ERP 워크센터 데이터 조회 완료: {}건", erpWorkCenters.size());

			// 2. MES 공통코드 상세(COM010)에 워크센터 정보 등록/업데이트
			for (ErpWorkCenter workCenter : erpWorkCenters) {
				try {
					// 2-1. CommonDetailCode 객체 생성
					CommonDetailCode detailCode = new CommonDetailCode();
					detailCode.setCodeId("COM010");
					detailCode.setCode(String.valueOf(workCenter.getWorkCenterSeq()));
					detailCode.setCodeNm(workCenter.getWorkCenterName());
					detailCode.setCodeDc(workCenter.getRemark() != null ? workCenter.getRemark() : "");
					detailCode.setUseAt("Y");

					// 2-2. MES 공통코드 상세에 해당 워크센터가 존재하는지 확인
					java.util.Map<String, String> params = new java.util.HashMap<>();
					params.put("codeId", "COM010");
					params.put("code", String.valueOf(workCenter.getWorkCenterSeq()));
					int count = commonDetailCodeDAO.selectCodeCheck(params);

					if (count == 0) {
						// 2-3. 신규 워크센터인 경우 INSERT
						commonDetailCodeDAO.insertCommonDetailCode(detailCode);
						insertCount++;
						log.debug("신규 워크센터 등록: {} ({})", workCenter.getWorkCenterName(), workCenter.getWorkCenterSeq());
					} else {
						// 2-4. 기존 워크센터인 경우 UPDATE
						commonDetailCodeDAO.updateCommonDetailCode(detailCode);
						updateCount++;
						log.debug("기존 워크센터 업데이트: {} ({})", workCenter.getWorkCenterName(), workCenter.getWorkCenterSeq());
					}
				} catch (Exception e) {
					errorCount++;
					lastError = e;
					log.error("워크센터 정보 처리 실패: {} ({})", workCenter.getWorkCenterName(), workCenter.getWorkCenterSeq(), e);
				}
			}

			log.info("=== ERP 워크센터 정보 연동 완료 ===");
			log.info("총 처리: {}건, 신규등록: {}건, 업데이트: {}건, 오류: {}건",
					erpWorkCenters.size(), insertCount, updateCount, errorCount);

			// 오류가 하나라도 있으면 예외를 던져서 스케쥴러 히스토리에 실패로 기록
			if (errorCount > 0 && lastError != null) {
				throw new Exception(String.format("워크센터 정보 연동 중 오류 발생 - 총 처리: %d건, 성공: %d건, 실패: %d건. 마지막 오류: %s",
						erpWorkCenters.size(), insertCount + updateCount, errorCount, lastError.getMessage()), lastError);
			}

		} catch (Exception e) {
			log.error("워크센터 정보 연동 실패", e);
			throw e;
		}
	}

	/**
	 * ERP에서 워크센터 정보 조회 (JdbcTemplate 사용)
	 * @param fromDate 조회 시작 날짜 (yyyy-MM-dd)
	 * @param toDate 조회 종료 날짜 (yyyy-MM-dd)
	 * @return 워크센터 정보 리스트
	 */
	private List<ErpWorkCenter> selectErpWorkCenters(String fromDate, String toDate) {
		String sql = "SELECT CompanySeq, WorkCenterSeq, WorkCenterName, Remark, " +
				"LastUserSeq, LastDateTime " +
				"FROM SHM_IF_VIEW_TPDBaseWorkCenter " +
				"WHERE CONVERT(VARCHAR(10), LastDateTime, 120) BETWEEN ? AND ? " +
				"ORDER BY WorkCenterSeq";

		return erpJdbcTemplate.query(sql, new ErpWorkCenterRowMapper(), fromDate, toDate);
	}

	/**
	 * ERP 워크센터 데이터를 ErpWorkCenter 객체로 매핑하는 RowMapper
	 */
	private static class ErpWorkCenterRowMapper implements RowMapper<ErpWorkCenter> {
		@Override
		public ErpWorkCenter mapRow(ResultSet rs, int rowNum) throws SQLException {
			ErpWorkCenter workCenter = new ErpWorkCenter();
			workCenter.setCompanySeq(rs.getInt("CompanySeq"));
			workCenter.setWorkCenterSeq(rs.getInt("WorkCenterSeq"));
			workCenter.setWorkCenterName(rs.getString("WorkCenterName"));
			workCenter.setRemark(rs.getString("Remark"));
			workCenter.setLastUserSeq(rs.getInt("LastUserSeq"));
			workCenter.setLastDateTime(rs.getTimestamp("LastDateTime"));
			return workCenter;
		}
	}

	/**
	 * 스케쥴러에서 호출되는 워크센터 정보 프로세스 실행
	 * @param fromDate 조회 시작 날짜 (yyyy-MM-dd)
	 * @param toDate 조회 종료 날짜 (yyyy-MM-dd)
	 */
	@Override
	public void executeWorkCenterInterface(String fromDate, String toDate) throws Exception {
		log.info("╔══════════════════════════════════════╗");
		log.info("║  ERP-MES 워크센터 연동 시작          ║");
		log.info("╚══════════════════════════════════════╝");

		long startTime = System.currentTimeMillis();

		try {
			// 워크센터 정보 연동 실행
			syncWorkCenters(fromDate, toDate);

			long executionTime = System.currentTimeMillis() - startTime;
			log.info("╔══════════════════════════════════════╗");
			log.info("║  ERP-MES 워크센터 연동 완료          ║");
			log.info("║  실행 시간: {}ms                 ║", executionTime);
			log.info("╚══════════════════════════════════════╝");

		} catch (Exception e) {
			long executionTime = System.currentTimeMillis() - startTime;
			log.error("╔══════════════════════════════════════╗");
			log.error("║  ERP-MES 워크센터 연동 실패          ║");
			log.error("║  실행 시간: {}ms                 ║", executionTime);
			log.error("╚══════════════════════════════════════╝");
			throw e;
		}
	}
}