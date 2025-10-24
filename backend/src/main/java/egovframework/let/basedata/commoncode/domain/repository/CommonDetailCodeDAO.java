package egovframework.let.basedata.commoncode.domain.repository;

import egovframework.let.basedata.commoncode.domain.model.CommonDetailCode;
import egovframework.let.basedata.commoncode.domain.model.CommonDetailCodeVO;
import org.egovframe.rte.psl.dataaccess.EgovAbstractMapper;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

/**
 * MES 공통코드 상세 관리를 위한 데이터 접근 클래스
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
@Repository("CommonDetailCodeDAO")
public class CommonDetailCodeDAO extends EgovAbstractMapper {

    /**
     * 공통코드 상세 목록을 조회한다.
     *
     * @param codeId
     * @return
     * @throws Exception
     */
    public List<CommonDetailCode> selectCommonDetailCodeList(String codeId) throws Exception {
		return selectList("CommonDetailCodeDAO.selectCommonDetailCodeList", codeId);
	}

    /**
     * 공통코드 상세 목록을 조회한다 (사용 여부 필터링)
     *
     * @param params
     * @return
     * @throws Exception
     */
    public List<CommonDetailCode> selectCommonDetailCodeListByUseAt(Map<String, String> params) throws Exception {
		return selectList("CommonDetailCodeDAO.selectCommonDetailCodeListByUseAt", params);
	}

    /**
     * 공통코드 상세 정보를 조회한다.
     *
     * @param params
     * @return
     * @throws Exception
     */
    public CommonDetailCode selectCommonDetailCode(Map<String, String> params) throws Exception {
        return selectOne("CommonDetailCodeDAO.selectCommonDetailCode", params);
    }

    /**
     * 공통코드 상세를 등록한다.
     *
     * @param commonDetailCode
     * @throws Exception
     */
    public void insertCommonDetailCode(CommonDetailCode commonDetailCode) throws Exception {
        insert("CommonDetailCodeDAO.insertCommonDetailCode", commonDetailCode);
    }

    /**
     * 공통코드 상세를 수정한다.
     *
     * @param commonDetailCode
     * @throws Exception
     */
    public void updateCommonDetailCode(CommonDetailCode commonDetailCode) throws Exception {
        update("CommonDetailCodeDAO.updateCommonDetailCode", commonDetailCode);
    }

    /**
     * 공통코드 상세를 삭제한다.
     *
     * @param params
     * @throws Exception
     */
    public void deleteCommonDetailCode(Map<String, String> params) throws Exception {
        delete("CommonDetailCodeDAO.deleteCommonDetailCode", params);
    }

    /**
     * 공통코드 상세 코드 중복 체크
     */
    public int selectCodeCheck(Map<String, String> params) {
        return selectOne("CommonDetailCodeDAO.selectCodeCheck", params);
    }
}
