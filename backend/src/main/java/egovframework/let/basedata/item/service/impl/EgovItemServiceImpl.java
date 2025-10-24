package egovframework.let.basedata.item.service.impl;

import egovframework.let.basedata.item.domain.model.Item;
import egovframework.let.basedata.item.domain.model.ItemVO;
import egovframework.let.basedata.item.domain.repository.ItemDAO;
import egovframework.let.basedata.item.service.EgovItemService;
import lombok.RequiredArgsConstructor;
import org.egovframe.rte.fdl.cmmn.EgovAbstractServiceImpl;
import org.egovframe.rte.fdl.idgnr.EgovIdGnrService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.Resource;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 품목 관리를 위한 서비스 구현 클래스
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
@Service("EgovItemService")
@RequiredArgsConstructor
public class EgovItemServiceImpl extends EgovAbstractServiceImpl implements EgovItemService {

	private final ItemDAO itemDAO;

	@Resource(name = "egovItemIdGnrService")
	private EgovIdGnrService egovItemIdGnrService;

	/**
	 * 품목 목록을 조회한다.
	 */
	@Override
	public Map<String, Object> selectItemList(ItemVO itemVO) throws Exception {
		List<ItemVO> resultList = itemDAO.selectItemList(itemVO);
		int totalCount = itemDAO.selectItemListCnt(itemVO);

		Map<String, Object> map = new HashMap<>();
		map.put("resultList", resultList);
		map.put("resultCnt", Integer.toString(totalCount));

		return map;
	}

	/**
	 * 품목 상세 정보를 조회한다.
	 */
	@Override
	public Item selectItem(String itemId) throws Exception {
		return itemDAO.selectItem(itemId);
	}

	/**
	 * 품목을 등록한다.
	 */
	@Override
	@Transactional
	public void insertItem(Item item) throws Exception {
		String itemId = egovItemIdGnrService.getNextStringId();
		item.setItemId(itemId);
		itemDAO.insertItem(item);
	}

	/**
	 * 품목을 수정한다.
	 */
	@Override
	@Transactional
	public void updateItem(Item item) throws Exception {
		itemDAO.updateItem(item);
	}

	/**
	 * 품목을 삭제한다.
	 */
	@Override
	@Transactional
	public void deleteItem(String itemId) throws Exception {
		itemDAO.deleteItem(itemId);
	}

	@Override
	public boolean isItemCodeExists(String itemCode) throws Exception {
		int count = itemDAO.selectItemCodeCheck(itemCode);
		return count > 0;
	}

	@Override
	public boolean isItemCodeExistsForUpdate(String itemId, String itemCode) throws Exception {
		Map<String, String> params = new HashMap<>();
		params.put("itemId", itemId);
		params.put("itemCode", itemCode);

		int count = itemDAO.selectItemCodeCheckForUpdate(params);
		return count > 0;
	}
}
