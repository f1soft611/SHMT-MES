package egovframework.let.scheduler.service.impl;

import egovframework.let.scheduler.domain.model.ErpEmployee;
import egovframework.let.scheduler.domain.repository.MesUserInterfaceDAO;
import egovframework.let.scheduler.service.ErpToMesUserInterfaceService;
import egovframework.let.utl.sim.service.EgovFileScrty;
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
 * ERP-MES 사원정보 인터페이스 서비스 구현체
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
@Slf4j
@Service("erpToMesUserInterfaceService")
public class ErpToMesUserInterfaceServiceImpl implements ErpToMesUserInterfaceService {

	@Autowired
	@Qualifier("erpJdbcTemplate")
	private JdbcTemplate erpJdbcTemplate;

	@Autowired
	private MesUserInterfaceDAO mesUserInterfaceDAO;

	/**
	 * ERP 시스템의 사원 정보를 MES 시스템으로 연동
	 */
	@Override
	@Transactional
	public void syncUsers() throws Exception {
		log.info("=== ERP 사원정보 연동 시작 ===");
		
		int insertCount = 0;
		int updateCount = 0;
		int errorCount = 0;
		
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
						String pass = EgovFileScrty.encryptPassword(employee.getPassword(), employee.getEmpId());
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
					log.error("사원 정보 처리 실패: {} ({})", employee.getEmpName(), employee.getEmpId(), e);
				}
			}
			
			log.info("=== ERP 사원정보 연동 완료 ===");
			log.info("총 처리: {}건, 신규등록: {}건, 업데이트: {}건, 오류: {}건", 
					erpEmployees.size(), insertCount, updateCount, errorCount);
			
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
	 * 스케쥴러에서 호출되는 사원 정보 연동 프로세스 실행
	 */
	@Override
	public void executeInterface() throws Exception {
		log.info("╔══════════════════════════════════════╗");
		log.info("║  ERP-MES 사원정보 인터페이스 시작    ║");
		log.info("╚══════════════════════════════════════╝");
		
		long startTime = System.currentTimeMillis();
		
		try {
			// 사원 정보 연동 실행
			syncUsers();
			
			long executionTime = System.currentTimeMillis() - startTime;
			log.info("╔══════════════════════════════════════╗");
			log.info("║  ERP-MES 사원정보 인터페이스 완료    ║");
			log.info("║  실행 시간: {}ms                 ║", executionTime);
			log.info("╚══════════════════════════════════════╝");
			
		} catch (Exception e) {
			long executionTime = System.currentTimeMillis() - startTime;
			log.error("╔══════════════════════════════════════╗");
			log.error("║  ERP-MES 사원정보 인터페이스 실패    ║");
			log.error("║  실행 시간: {}ms                 ║", executionTime);
			log.error("╚══════════════════════════════════════╝");
			throw e;
		}
	}
}
