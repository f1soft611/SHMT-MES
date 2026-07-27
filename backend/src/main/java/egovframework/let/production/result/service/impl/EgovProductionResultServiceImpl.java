package egovframework.let.production.result.service.impl;

import egovframework.let.common.dto.ListResult;
import egovframework.let.production.result.domain.model.ProdResultBadDetailDto;
import egovframework.let.production.result.domain.model.*;
import egovframework.let.production.result.domain.repository.ProductionResultDAO;
import egovframework.let.production.result.service.EgovProductionResultService;
import egovframework.let.production.result.service.ErpIFProdResultService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.egovframe.rte.fdl.cmmn.EgovAbstractServiceImpl;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.util.List;

/**
 * 생산계획 관리를 위한 서비스 구현 클래스
 * @author SHMT-MES
 * @since 2025.11.21
 * @version 1.0
 * @see
 *
 * <pre>
 * << 개정이력(Modification Information) >>
 *
 *   수정일      수정자           수정내용
 *  -------    --------    ---------------------------
 *   2025.11.21 SHMT-MES          최초 생성
 *
 * </pre>
 */
@Slf4j
@Service("egovProductionResultService")
@RequiredArgsConstructor
public class EgovProductionResultServiceImpl extends EgovAbstractServiceImpl implements EgovProductionResultService {

	private final ProductionResultDAO productionResultDAO;
	private final ErpIFProdResultService erpIfService;

	@Override
	public ListResult<ProdResultOrderRow> selectProductionOrderList(ProdResultSearchDto dto) throws Exception {


		List<ProdResultOrderRow> list = productionResultDAO.selectProductionOrderList(dto);
		int resultCnt = productionResultDAO.selectProductionOrderListCount(dto);

		return new ListResult<>(list, resultCnt);
	}

	@Override
	@Transactional
	public void insertProductionResult(List<ProdResultInsertDto> resultList) throws Exception {
		for(ProdResultInsertDto dto : resultList){
			String tpr601Id = dto.getTpr601Id();
			if (tpr601Id.toLowerCase().startsWith("new-")) {
				// 저장일자의 max TPR601ID 값 가져오기
				String nextId = productionResultDAO.selectProdResultNextId();
				dto.setTpr601Id(nextId);

				// prod_seq 값 가져오기
				Integer prodSeq = productionResultDAO.selectProdSeq(dto);
				dto.setProdSeq(prodSeq);

				// TPR601 저장
				productionResultDAO.insertProductionResult(dto);

				// TPR601W 저장
				saveProductionResultWorkers(dto);

				// 불량 상세 저장
				saveProductionResultBadDetails(dto);


				// ERP IF 전송 (A) - 실패해도 MES 저장은 유지
				try {
					ProdResultErpLinkRow row = productionResultDAO.selectProductionResultForErp(dto);
					erpIfService.sendProdResultToErp(buildAddIfDto(
							row, dto.getProdQty(), dto.getGoodQty(), dto.getBadQty(),
							dto.getProdStime(), dto.getProdEtime(), dto.getWorkerCodes()));
				} catch (Exception e) {
					log.warn("생산실적 ERP 전송 실패 - tpr601Id={}", dto.getTpr601Id(), e);
				}


				// TPR601M 저장


				// TPR504 ORDER_FLAG UPDATE
//				ProdResultOrderFlagDto flagDto = new ProdResultOrderFlagDto();
//				flagDto.setOrderFlag("X");
//				flagDto.setProdplanDate(dto.getProdplanDate());
//				flagDto.setProdplanSeq(dto.getProdplanSeq());
//				flagDto.setFactoryCode(dto.getFactoryCode());
//				productionResultDAO.updateProdOrderOrderFlag(flagDto);
			}

		}
	}

	@Override
	@Transactional
	public void updateProductionResult(List<ProdResultUpdateDto> resultList) throws Exception {

		for(ProdResultUpdateDto  dto : resultList){

			// TPR601 UPDATE
			productionResultDAO.updateProductionResult(dto);

			// TPR601W DELETE ALL -> INSERT
			productionResultDAO.deleteProductionResultWorker(dto);
			saveProductionResultWorkers(dto);

			// 🔥 3. 불량 DELETE → INSERT (추가)
			saveProductionResultBadDetails(dto);


			// TPR601M DELETE ALL -> INSERT
		}
	}

	// 생산실적 삭제
	@Override
	@Transactional
	public void deleteProductionResult(ProdResultDeleteDto dto) throws Exception {

		// 1. 실적별 불량 상세 삭제 TPR605
		productionResultDAO.deleteBadDetails(dto);

		// 2. 작업자 삭제 TPR601W
		productionResultDAO.deleteProductionResultWorker(dto);

		// 3. 설비상태 삭제 TPR610
		productionResultDAO.deleteProductionResultEquipStatus(dto);

		// 실적별 투입자재 삭제 TPR601M
//		productionResultDAO.deleteProductionResultMaterial(dto); // todo: 투입자재 삭제로직

		// 4. 실적 삭제 TPR601
		productionResultDAO.deleteProductionResult(dto);

	}



	@Override
	public ListResult<ProdResultRow> selectProductionResultDetailList(ProdResultDto dto) throws Exception {
		List<ProdResultRow> list = productionResultDAO.selectProductionResultDetailList(dto);

		return new ListResult<>(list, 0);
	}

	// 불량 상세 목록 조회
	@Override
	public ListResult<ProdResultBadDetailDto> selectBadDetails(ProdResultBaseDetailDto dto) throws Exception {
		List<ProdResultBadDetailDto> list = productionResultDAO.selectBadDetails(dto);

		return new ListResult<>(list, 0);
	}


	// 생산실적 작업자 저장
	private void saveProductionResultWorkers(ProdResultDetailParent parent) throws Exception {
		List<String> workers = parent.getWorkerCodes();
		if (workers == null || workers.isEmpty()) return;

		for (String workerCode : workers) {
			ProdResultWorkerDto dto = new ProdResultWorkerDto();

			// key 복사
			dto.setFactoryCode(parent.getFactoryCode());
			dto.setProdplanDate(parent.getProdplanDate());
			dto.setProdplanSeq(parent.getProdplanSeq());
			dto.setProdworkSeq(parent.getProdworkSeq());
			dto.setWorkSeq(parent.getWorkSeq());
			dto.setProdSeq(parent.getProdSeq());

			dto.setTpr601Id(parent.getTpr601Id());
			dto.setWorkerCode(workerCode);

			// 채번
			dto.setTpr601wId(productionResultDAO.selectProdResultWorkerNextId());
			dto.setWorkerSeq(productionResultDAO.selectProdResultWorkerSeq(dto));

			productionResultDAO.insertProductionResultWorker(dto);
		}
	}

	// 생산실적 불량 상세 저장
	private void saveProductionResultBadDetails(ProdResultDetailParent parent) throws Exception {

		List<ProdResultBadDetailDto> badList = parent.getBadDetails();

		productionResultDAO.deleteBadDetails(parent);

		if (badList == null || badList.isEmpty()) return;

		int seq = 1;

		for (ProdResultBadDetailDto bad : badList) {
			if (bad.getQcQty() == null || bad.getQcQty() <= 0) continue;

			// DTO 생성
			ProdResultBadDetailDto dto = new ProdResultBadDetailDto();

			String nextId = productionResultDAO.selectProdResultBadNextId();
			dto.setTpr605Id(nextId);

			// key 복사
			dto.setFactoryCode(parent.getFactoryCode());
			dto.setProdplanDate(parent.getProdplanDate());
			dto.setProdplanSeq(parent.getProdplanSeq());
			dto.setProdworkSeq(parent.getProdworkSeq());
			dto.setWorkSeq(parent.getWorkSeq());
			dto.setProdSeq(parent.getProdSeq());
			dto.setWorkCode(parent.getWorkCode());

			// 불량 정보
			dto.setQcCode(bad.getQcCode());
			dto.setQcQty(bad.getQcQty());

			dto.setBadSeq(seq++);

			productionResultDAO.insertBadDetail(dto);
		}
	}

	// ERP IF 'A'(신규/재생성) 페이로드 구성
	private ErpIFProdResultDto buildAddIfDto(
			ProdResultErpLinkRow row, Integer prodQty, Integer goodQty, Integer badQty,
			String prodStime, String prodEtime, List<String> workerCodes) {

		ErpIFProdResultDto dto = new ErpIFProdResultDto();
		dto.setWorkingTag("A");
		dto.setRegEmpId("SYSTEM");
		dto.setMesIfKey(row.getTpr601Id());
		dto.setWorkDate(row.getProdplanDate());
		dto.setWorkOrderSeq(row.getWorkorderSeq());
		dto.setWorkOrderSerl(row.getWorkorderSeq());
		dto.setWorkOrderNo(row.getLotNo());
		dto.setLotNo(row.getLotNo());
		dto.setDeptSeq(0);
		dto.setEmpSeq(0);
		dto.setWorkCenterSeq(1);
		dto.setItemSeq(parseItemSeq(row.getItemCode()));
		dto.setUnitSeq(0);
		dto.setProdQty(prodQty);
		dto.setOkQty(goodQty);
		dto.setBadQty(badQty);
		dto.setWorkStartTime(toHHmm(prodStime));
		dto.setWorkEndTime(toHHmm(prodEtime));
		dto.setWorkerQty(workerCodes != null ? workerCodes.size() : 0);
		return dto;
	}

	// "yyyy-MM-dd HH:mm" → "HHmm" (짧으면 null)
	private String toHHmm(String dateTimeStr) {
		if (dateTimeStr == null || dateTimeStr.length() < 16) return null;
		return dateTimeStr.substring(11, 13) + dateTimeStr.substring(14, 16);
	}

	// 품목코드를 ERP ItemSeq(정수)로 변환, 실패 시 0
	private Integer parseItemSeq(String itemCode) {
		try {
			return (itemCode != null && !itemCode.trim().isEmpty()) ? Integer.parseInt(itemCode.trim()) : 0;
		} catch (NumberFormatException e) {
			return 0;
		}
	}

}
