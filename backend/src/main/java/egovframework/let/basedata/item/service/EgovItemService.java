package egovframework.let.basedata.item.service;

import egovframework.let.basedata.item.domain.model.Item;
import egovframework.let.basedata.item.domain.model.ItemVO;

import java.util.Map;

/**
 * 품목 관리를 위한 서비스 인터페이스 클래스
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
public interface EgovItemService {

	/**
	 * 품목 목록을 조회한다.
	 * 
	 * @param itemVO
	 * @exception Exception
	 */
	public Map<String, Object> selectItemList(ItemVO itemVO) throws Exception;

	/**
	 * 품목 상세 정보를 조회한다.
	 * 
	 * @param itemId
	 * @exception Exception
	 */
	public Item selectItem(String itemId) throws Exception;

	/**
	 * 품목을 등록한다.
	 * 
	 * @param item
	 * @exception Exception
	 */
	public void insertItem(Item item) throws Exception;

	/**
	 * 품목을 수정한다.
	 * 
	 * @param item
	 * @exception Exception
	 */
	public void updateItem(Item item) throws Exception;

	/**
	 * 품목을 삭제한다.
	 * 
	 * @param itemId
	 * @exception Exception
	 */
	public void deleteItem(String itemId) throws Exception;

	/**
	 * 품목 코드 존재 여부 확인
	 * @param itemCode 품목 코드
	 * @return 존재 여부
	 * @throws Exception
	 */
	boolean isItemCodeExists(String itemCode) throws Exception;

	/**
	 * 품목 코드 중복 체크 (수정 시)
	 * @param itemId 품목 ID
	 * @param itemCode 품목 코드
	 * @return 중복 여부
	 * @throws Exception
	 */
	boolean isItemCodeExistsForUpdate(String itemId, String itemCode) throws Exception;
}
