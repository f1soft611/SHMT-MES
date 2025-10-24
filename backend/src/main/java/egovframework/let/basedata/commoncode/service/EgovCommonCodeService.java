package egovframework.let.basedata.commoncode.service;

import egovframework.let.basedata.commoncode.domain.model.CommonCode;
import egovframework.let.basedata.commoncode.domain.model.CommonCodeVO;
import egovframework.let.basedata.commoncode.domain.model.CommonDetailCode;

import java.util.List;
import java.util.Map;

/**
 * MES 공통코드 관리를 위한 서비스 인터페이스 클래스
 * @author SHMT-MES
 * @since 2025.10.24
 * @version 1.0
 * @see
 *
 * <pre>
 * << 개정이력(Modification Information) >>
 *
 *   수정일      수정자           수정내용
 *  -------    --------    ---------------------------
 *   2025.10.24 SHMT-MES          최초 생성
 *
 * </pre>
 */
public interface EgovCommonCodeService {

	/**
	 * 공통코드 목록을 조회한다.
	 * 
	 * @param commonCodeVO
	 * @exception Exception
	 */
	public Map<String, Object> selectCommonCodeList(CommonCodeVO commonCodeVO) throws Exception;

	/**
	 * 공통코드 상세 정보를 조회한다.
	 * 
	 * @param codeId
	 * @exception Exception
	 */
	public CommonCode selectCommonCode(String codeId) throws Exception;

	/**
	 * 공통코드를 등록한다.
	 * 
	 * @param commonCode
	 * @exception Exception
	 */
	public void insertCommonCode(CommonCode commonCode) throws Exception;

	/**
	 * 공통코드를 수정한다.
	 * 
	 * @param commonCode
	 * @exception Exception
	 */
	public void updateCommonCode(CommonCode commonCode) throws Exception;

	/**
	 * 공통코드를 삭제한다.
	 * 
	 * @param codeId
	 * @exception Exception
	 */
	public void deleteCommonCode(String codeId) throws Exception;

	/**
	 * 공통코드 ID 존재 여부 확인
	 * @param codeId 코드 ID
	 * @return 존재 여부
	 * @throws Exception
	 */
	boolean isCodeIdExists(String codeId) throws Exception;

	/**
	 * 공통코드 상세 목록을 조회한다.
	 * 
	 * @param codeId
	 * @exception Exception
	 */
	public List<CommonDetailCode> selectCommonDetailCodeList(String codeId) throws Exception;

	/**
	 * 공통코드 상세 목록을 조회한다 (사용 여부 필터링)
	 * 
	 * @param codeId
	 * @param useAt
	 * @exception Exception
	 */
	public List<CommonDetailCode> selectCommonDetailCodeListByUseAt(String codeId, String useAt) throws Exception;

	/**
	 * 공통코드 상세 정보를 조회한다.
	 * 
	 * @param codeId
	 * @param code
	 * @exception Exception
	 */
	public CommonDetailCode selectCommonDetailCode(String codeId, String code) throws Exception;

	/**
	 * 공통코드 상세를 등록한다.
	 * 
	 * @param commonDetailCode
	 * @exception Exception
	 */
	public void insertCommonDetailCode(CommonDetailCode commonDetailCode) throws Exception;

	/**
	 * 공통코드 상세를 수정한다.
	 * 
	 * @param commonDetailCode
	 * @exception Exception
	 */
	public void updateCommonDetailCode(CommonDetailCode commonDetailCode) throws Exception;

	/**
	 * 공통코드 상세를 삭제한다.
	 * 
	 * @param codeId
	 * @param code
	 * @exception Exception
	 */
	public void deleteCommonDetailCode(String codeId, String code) throws Exception;

	/**
	 * 공통코드 상세 코드 존재 여부 확인
	 * @param codeId 코드 ID
	 * @param code 코드
	 * @return 존재 여부
	 * @throws Exception
	 */
	boolean isCodeExists(String codeId, String code) throws Exception;
}
