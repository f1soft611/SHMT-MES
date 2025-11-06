package egovframework.let.scheduler.service.impl;

import egovframework.let.scheduler.domain.model.ErpEmployee;
import egovframework.let.scheduler.domain.repository.ErpUserInterfaceDAO;
import egovframework.let.scheduler.service.ErpToMesUserInterfaceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
@RequiredArgsConstructor
public class ErpToMesUserInterfaceServiceImpl implements ErpToMesUserInterfaceService {

	private final ErpUserInterfaceDAO erpUserInterfaceDAO;

	/**
	 * ERP 시스템의 사원 정보를 MES 시스템으로 연동
	 */
	@Override
	@Transactional(transactionManager = "erpTransactionManager")
	public void syncUsers() throws Exception {
		log.info("=== ERP 사원정보 연동 시작 ===");
		
		int insertCount = 0;
		int updateCount = 0;
		int errorCount = 0;
		
		try {
			// 1. ERP 시스템에서 사원 정보 조회
			log.info("ERP 시스템(SHM_IF_VIEW_TDAEmp)에서 사원 데이터 조회 시작");
			List<ErpEmployee> erpEmployees = erpUserInterfaceDAO.selectErpEmployees();
			log.info("ERP 사원 데이터 조회 완료: {}건", erpEmployees.size());
			
			// 2. MES 시스템에 사원 정보 등록/업데이트
			for (ErpEmployee employee : erpEmployees) {
				try {
					// 2-1. MES에 해당 사원이 존재하는지 확인
					int count = erpUserInterfaceDAO.selectMesUserCount(employee.getEmpId());
					
					if (count == 0) {
						// 2-2. 신규 사원인 경우 INSERT
						erpUserInterfaceDAO.insertMesUser(employee);
						insertCount++;
						log.debug("신규 사원 등록: {} ({})", employee.getEmpName(), employee.getEmpId());
					} else {
						// 2-3. 기존 사원인 경우 UPDATE
						erpUserInterfaceDAO.updateMesUser(employee);
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
