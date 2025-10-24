package egovframework.let.basedata.commoncode.service.impl;

import egovframework.let.basedata.commoncode.domain.model.CommonCode;
import egovframework.let.basedata.commoncode.domain.model.CommonCodeVO;
import egovframework.let.basedata.commoncode.domain.model.CommonDetailCode;
import egovframework.let.basedata.commoncode.domain.repository.CommonCodeDAO;
import egovframework.let.basedata.commoncode.domain.repository.CommonDetailCodeDAO;
import egovframework.let.basedata.commoncode.service.EgovCommonCodeService;
import lombok.RequiredArgsConstructor;
import org.egovframe.rte.fdl.cmmn.EgovAbstractServiceImpl;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * MES 공통코드 관리를 위한 서비스 구현 클래스
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
@Service("EgovCommonCodeService")
@RequiredArgsConstructor
public class EgovCommonCodeServiceImpl extends EgovAbstractServiceImpl implements EgovCommonCodeService {

	private final CommonCodeDAO commonCodeDAO;
	private final CommonDetailCodeDAO commonDetailCodeDAO;

	/**
	 * 공통코드 목록을 조회한다.
	 */
	@Override
	public Map<String, Object> selectCommonCodeList(CommonCodeVO commonCodeVO) throws Exception {
		List<CommonCodeVO> resultList = commonCodeDAO.selectCommonCodeList(commonCodeVO);
		int totalCount = commonCodeDAO.selectCommonCodeListCnt(commonCodeVO);

		Map<String, Object> map = new HashMap<>();
		map.put("resultList", resultList);
		map.put("resultCnt", Integer.toString(totalCount));

		return map;
	}

	/**
	 * 공통코드 상세 정보를 조회한다.
	 */
	@Override
	public CommonCode selectCommonCode(String codeId) throws Exception {
		return commonCodeDAO.selectCommonCode(codeId);
	}

	/**
	 * 공통코드를 등록한다.
	 */
	@Override
	@Transactional
	public void insertCommonCode(CommonCode commonCode) throws Exception {
		commonCodeDAO.insertCommonCode(commonCode);
	}

	/**
	 * 공통코드를 수정한다.
	 */
	@Override
	@Transactional
	public void updateCommonCode(CommonCode commonCode) throws Exception {
		commonCodeDAO.updateCommonCode(commonCode);
	}

	/**
	 * 공통코드를 삭제한다.
	 */
	@Override
	@Transactional
	public void deleteCommonCode(String codeId) throws Exception {
		commonCodeDAO.deleteCommonCode(codeId);
	}

	@Override
	public boolean isCodeIdExists(String codeId) throws Exception {
		int count = commonCodeDAO.selectCodeIdCheck(codeId);
		return count > 0;
	}

	/**
	 * 공통코드 상세 목록을 조회한다.
	 */
	@Override
	public List<CommonDetailCode> selectCommonDetailCodeList(String codeId) throws Exception {
		return commonDetailCodeDAO.selectCommonDetailCodeList(codeId);
	}

	/**
	 * 공통코드 상세 목록을 조회한다 (사용 여부 필터링)
	 */
	@Override
	public List<CommonDetailCode> selectCommonDetailCodeListByUseAt(String codeId, String useAt) throws Exception {
		Map<String, String> params = new HashMap<>();
		params.put("codeId", codeId);
		params.put("useAt", useAt);
		return commonDetailCodeDAO.selectCommonDetailCodeListByUseAt(params);
	}

	/**
	 * 공통코드 상세 정보를 조회한다.
	 */
	@Override
	public CommonDetailCode selectCommonDetailCode(String codeId, String code) throws Exception {
		Map<String, String> params = new HashMap<>();
		params.put("codeId", codeId);
		params.put("code", code);
		return commonDetailCodeDAO.selectCommonDetailCode(params);
	}

	/**
	 * 공통코드 상세를 등록한다.
	 */
	@Override
	@Transactional
	public void insertCommonDetailCode(CommonDetailCode commonDetailCode) throws Exception {
		commonDetailCodeDAO.insertCommonDetailCode(commonDetailCode);
	}

	/**
	 * 공통코드 상세를 수정한다.
	 */
	@Override
	@Transactional
	public void updateCommonDetailCode(CommonDetailCode commonDetailCode) throws Exception {
		commonDetailCodeDAO.updateCommonDetailCode(commonDetailCode);
	}

	/**
	 * 공통코드 상세를 삭제한다.
	 */
	@Override
	@Transactional
	public void deleteCommonDetailCode(String codeId, String code) throws Exception {
		Map<String, String> params = new HashMap<>();
		params.put("codeId", codeId);
		params.put("code", code);
		commonDetailCodeDAO.deleteCommonDetailCode(params);
	}

	@Override
	public boolean isCodeExists(String codeId, String code) throws Exception {
		Map<String, String> params = new HashMap<>();
		params.put("codeId", codeId);
		params.put("code", code);
		int count = commonDetailCodeDAO.selectCodeCheck(params);
		return count > 0;
	}
}
