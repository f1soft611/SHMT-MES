package egovframework.let.scheduler.domain.repository;

import egovframework.let.scheduler.domain.model.ErpEmployee;
import egovframework.rte.psl.dataaccess.mapper.Mapper;

import java.util.List;

/**
 * ERP 사원 정보 인터페이스 DAO
 * 
 * @author SHMT-MES
 * @since 2025.11.06
 * @version 1.0
 */
@Mapper("erpUserInterfaceDAO")
public interface ErpUserInterfaceDAO {

	/**
	 * ERP에서 사원 정보 조회
	 * @return 사원 정보 리스트
	 * @throws Exception
	 */
	List<ErpEmployee> selectErpEmployees() throws Exception;

	/**
	 * MES 사용자 테이블에 사원 정보 존재 여부 확인
	 * @param empId 사원번호
	 * @return 존재 개수
	 * @throws Exception
	 */
	int selectMesUserCount(String empId) throws Exception;

	/**
	 * MES 사용자 테이블에 사원 정보 삽입
	 * @param employee ERP 사원 정보
	 * @throws Exception
	 */
	void insertMesUser(ErpEmployee employee) throws Exception;

	/**
	 * MES 사용자 테이블의 사원 정보 업데이트
	 * @param employee ERP 사원 정보
	 * @throws Exception
	 */
	void updateMesUser(ErpEmployee employee) throws Exception;
}
