package egovframework.let.scheduler.domain.repository;

import egovframework.let.scheduler.domain.model.ErpEmployee;
import egovframework.rte.psl.dataaccess.mapper.Mapper;

/**
 * MES 사용자 정보 인터페이스 DAO (MES 데이터베이스 쓰기)
 * 
 * @author SHMT-MES
 * @since 2025.11.06
 * @version 1.0
 */
@Mapper("mesUserInterfaceDAO")
public interface MesUserInterfaceDAO {

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
