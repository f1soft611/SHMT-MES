package egovframework.let.basedata.commoncode.domain.repository;

import egovframework.let.basedata.commoncode.domain.model.CommonCode;
import egovframework.let.basedata.commoncode.domain.model.CommonCodeVO;
import org.egovframe.rte.psl.dataaccess.EgovAbstractMapper;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

/**
 * MES 공통코드 관리를 위한 데이터 접근 클래스
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
@Repository("CommonCodeDAO")
public class CommonCodeDAO extends EgovAbstractMapper {

    /**
     * 공통코드 목록을 조회한다.
     *
     * @param commonCodeVO
     * @return
     * @throws Exception
     */
    public List<CommonCodeVO> selectCommonCodeList(CommonCodeVO commonCodeVO) throws Exception {
		return selectList("CommonCodeDAO.selectCommonCodeList", commonCodeVO);
	}

    /**
     * 공통코드 목록 전체 건수를 조회한다.
     *
     * @param commonCodeVO
     * @return
     * @throws Exception
     */
    public int selectCommonCodeListCnt(CommonCodeVO commonCodeVO) throws Exception {
        return (Integer)selectOne("CommonCodeDAO.selectCommonCodeListCnt", commonCodeVO);
    }

    /**
     * 공통코드 상세 정보를 조회한다.
     *
     * @param codeId
     * @return
     * @throws Exception
     */
    public CommonCode selectCommonCode(String codeId) throws Exception {
        return selectOne("CommonCodeDAO.selectCommonCode", codeId);
    }

    /**
     * 공통코드를 등록한다.
     *
     * @param commonCode
     * @throws Exception
     */
    public void insertCommonCode(CommonCode commonCode) throws Exception {
        insert("CommonCodeDAO.insertCommonCode", commonCode);
    }

    /**
     * 공통코드를 수정한다.
     *
     * @param commonCode
     * @throws Exception
     */
    public void updateCommonCode(CommonCode commonCode) throws Exception {
        update("CommonCodeDAO.updateCommonCode", commonCode);
    }

    /**
     * 공통코드를 삭제한다.
     *
     * @param codeId
     * @throws Exception
     */
    public void deleteCommonCode(String codeId) throws Exception {
        delete("CommonCodeDAO.deleteCommonCode", codeId);
    }

    /**
     * 공통코드 ID 중복 체크
     */
    public int selectCodeIdCheck(String codeId) {
        return selectOne("CommonCodeDAO.selectCodeIdCheck", codeId);
    }

    /**
     * 공통코드 ID 중복 체크 (수정 시)
     */
    public int selectCodeIdCheckForUpdate(Map<String, String> params) {
        return selectOne("CommonCodeDAO.selectCodeIdCheckForUpdate", params);
    }
}
