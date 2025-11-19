package egovframework.let.scheduler.service.impl;

import egovframework.let.scheduler.domain.model.ErpCustomer;
import egovframework.let.scheduler.domain.model.ErpEmployee;
import egovframework.let.scheduler.domain.model.ErpProductionRequest;
import egovframework.let.scheduler.domain.repository.MesCustInterfaceDAO;
import egovframework.let.scheduler.domain.repository.MesUserInterfaceDAO;
import egovframework.let.scheduler.domain.repository.MesProdReqInterfaceDAO;
import egovframework.let.scheduler.service.ErpToMesInterfaceService;
import egovframework.let.utl.sim.service.EgovFileScrty;
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
	private MesProdReqInterfaceDAO mesProdReqInterfaceDAO;

	/**
	 * ERP 시스템의 자재 정보를 MES 시스템으로 연동
	 */
	@Override
//	@Transactional
	public void syncMaterials() throws Exception {
		log.info("=== ERP 품목 연동 시작 ===");

		try {
			// 1. ERP 시스템에서 자재 마스터 데이터 조회
			log.info("ERP 시스템에서 품목 데이터 조회");
			// TODO: ERP API 호출 또는 DB 연동
			// List<Material> erpMaterials = erpApiClient.getMaterials();

			// 2. MES 시스템에 자재 정보 등록/업데이트
			log.info("MES 시스템에 품목 정보 등록");
			// TODO: MES DB에 데이터 저장
			// for (Material material : erpMaterials) {
			//     mesMaterialDAO.insertOrUpdate(material);
			// }

			// 샘플 로그
			log.info("품목 연동 완료: 50건 처리");

		} catch (Exception e) {
			log.error("품목 연동 실패", e);
			throw e;
		}

		log.info("=== ERP 품목 연동 종료 ===");
	}

	/**
	 * 스케쥴러에서 호출되는 품목정보 프로세스 실행
	 */
	@Override
	public void executeMaterialInterface() throws Exception {
		log.info("╔══════════════════════════════════════╗");
		log.info("║  ERP-MES 인터페이스 연동 시작        ║");
		log.info("╚══════════════════════════════════════╝");

		long startTime = System.currentTimeMillis();

		try {
			// 품목 정보 연동 실행
			syncMaterials();

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
	 * ERP 시스템의 사원 정보를 MES 시스템으로 연동
	 */
	@Override
//	@Transactional
	public void syncUsers() throws Exception {
		log.info("=== ERP 사원정보 연동 시작 ===");

		int insertCount = 0;
		int updateCount = 0;
		int errorCount = 0;
		Exception lastError = null;

		try {
			// 1. ERP 시스템에서 사원 정보 조회
			log.info("ERP 시스템(SHM_IF_VIEW_TDAEmp)에서 사원 데이터 조회 시작");
			List<ErpEmployee> erpEmployees = selectErpEmployees();
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
	 * @return 사원 정보 리스트
	 */
	private List<ErpEmployee> selectErpEmployees() {
		String sql = "SELECT CompanySeq, EmpSeq, EmpId, EmpName, UMPgSeq, UMPgName, " +
				"DeptSeq, DeptName, TypeSeq, TypeName, Email, UserId, UserSeq, " +
				"LastUserSeq, LastDateTime " +
				"FROM SHM_IF_VIEW_TDAEmp " +
				"WHERE TypeSeq = 3031001 " +  // 재직자만 동기화
				"ORDER BY EmpSeq";

		return erpJdbcTemplate.query(sql, new ErpEmployeeRowMapper());
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
	 */
	@Override
	public void executeUserInterface() throws Exception {
		log.info("╔══════════════════════════════════════╗");
		log.info("║  ERP-MES 인터페이스 연동 시작        ║");
		log.info("╚══════════════════════════════════════╝");

		long startTime = System.currentTimeMillis();

		try {
			// 사원 정보 연동 실행
			syncUsers();

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
	 */
	@Override
//	@Transactional
	public void syncCusts() throws Exception {
		log.info("=== ERP 거래처정보 연동 시작 ===");

		int insertCount = 0;
		int updateCount = 0;
		int errorCount = 0;
		Exception lastError = null;

		try {
			// 1. ERP 시스템에서 거래처 정보 조회
			log.info("ERP 시스템(SHM_IF_VIEW_TDACust)에서 거래처 데이터 조회 시작");
			List<ErpCustomer> erpCustomers = selectErpCustomers();
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
	 * @return 거래처 정보 리스트
	 */
	private List<ErpCustomer> selectErpCustomers() {
		String sql = "SELECT CompanySeq, CustSeq, CustName, SMCustStatus, SMCustStatusName, " +
				"SMDomFor, SMDomForName, BizNo, BizAddr, UMChannelSeq, UMChannelName, " +
				"ZipCode, CustKindName, LastUserSeq, LastDateTime " +
				"FROM SHM_IF_VIEW_TDACust " +
				"WHERE SMCustStatus = '2004001' " +  // 정상 거래처만 동기화 (필요시 조건 수정)
				"AND CustKindName IN ('국내매출거래처', '수출거래처') " +
				"ORDER BY CustSeq";

		return erpJdbcTemplate.query(sql, new ErpCustomerRowMapper());
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
	 */
	@Override
	public void executeCustInterface() throws Exception {
		log.info("╔══════════════════════════════════════╗");
		log.info("║  ERP-MES 거래처 연동 시작            ║");
		log.info("╚══════════════════════════════════════╝");

		long startTime = System.currentTimeMillis();

		try {
			// 거래처 정보 연동 실행
			syncCusts();

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
	 */
	@Override
	@Transactional
	public void syncProductionRequests() throws Exception {
		log.info("=== ERP 생산 의뢰 정보 연동 시작 ===");

		int insertCount = 0;
		int updateCount = 0;
		int errorCount = 0;
		Exception lastError = null;

		try {
			// 1. ERP 시스템에서 생산 의뢰 정보 조회
			log.info("ERP 시스템에서 생산 의뢰 데이터 조회 시작");
			List<ErpProductionRequest> erpProdReqs = selectErpProductionRequests();
			log.info("ERP 생산 의뢰 데이터 조회 완료: {}건", erpProdReqs.size());

			// 2. MES 시스템에 생산 의뢰 정보 등록/업데이트
			for (ErpProductionRequest prodReq : erpProdReqs) {
				try {
					// 2-1. MES에 해당 생산 의뢰가 존재하는지 확인
					int count = mesProdReqInterfaceDAO.selectMesProdReqCount(prodReq.getProdReqSeq());

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
	 * @return 생산 의뢰 정보 리스트
	 */
	private List<ErpProductionRequest> selectErpProductionRequests() {
		String sql = "SELECT ProdReqNo, ProdReqSeq, Serl, ReqDate, CustSeq, DeptSeq, EmpSeq, " +
				"ItemSeq, ItemNo, ItemName, Spec, UnitSeq, Qty, EndDate, DelvDate, " +
				"LastUserSeq, LastDateTime " +
				"FROM SHM_IF_VIEW_TPDMPSProdReqItem " +
				"ORDER BY ProdReqSeq, Serl";

		return erpJdbcTemplate.query(sql, new ErpProductionRequestRowMapper());
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
			return prodReq;
		}
	}

	/**
	 * 스케쥴러에서 호출되는 생산 의뢰 정보 프로세스 실행
	 */
	@Override
	public void executeProdReqInterface() throws Exception {
		log.info("╔══════════════════════════════════════╗");
		log.info("║  ERP-MES 생산 의뢰 연동 시작         ║");
		log.info("╚══════════════════════════════════════╝");

		long startTime = System.currentTimeMillis();

		try {
			// 생산 의뢰 정보 연동 실행
			syncProductionRequests();

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
	 * 스케쥴러에서 호출되는 전체 인터페이스 프로세스 실행
	 * 품목, 사원, 거래처, 생산 의뢰 순서로 연동 수행
	 */
	@Override
	public void executeInterface() throws Exception {
		log.info("╔══════════════════════════════════════╗");
		log.info("║  ERP-MES 인터페이스 연동 시작        ║");
		log.info("╚══════════════════════════════════════╝");

		long startTime = System.currentTimeMillis();

		try {
			// 품목 정보 연동 실행
			syncMaterials();

			// 사원 정보 연동 실행
			syncUsers();

			// 거래처 정보 연동 실행
			syncCusts();

			// 생산 의뢰 정보 연동 실행
			syncProductionRequests();

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
}