package egovframework.let.production.result.service.impl;

import egovframework.let.common.dto.ListResult;
import egovframework.let.production.result.domain.model.*;
import egovframework.let.production.result.domain.repository.ProductionResultDAO;
import egovframework.let.production.result.service.EgovProductionResultService;
import lombok.RequiredArgsConstructor;
import org.egovframe.rte.fdl.cmmn.EgovAbstractServiceImpl;
import org.egovframe.rte.fdl.idgnr.EgovIdGnrService;
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
@Service("egovProductionResultService")
@RequiredArgsConstructor
public class EgovProductionResultServiceImpl extends EgovAbstractServiceImpl implements EgovProductionResultService {

	private final ProductionResultDAO productionResultDAO;

//	@Resource(name = "egovProdResultIdGnrService")
//	private EgovIdGnrService egovProdPlanIdgenService;

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


			// TPR601M DELETE ALL -> INSERT
		}
	}

	// 생산실적 삭제
	@Override
	@Transactional
	public void deleteProductionResult(ProdResultDeleteDto dto) throws Exception {

		// 1. 실적별 작업자 삭제 TPR601W
		productionResultDAO.deleteProductionResultWorker(dto);

		// 2. 실적별 투입자재 삭제 TPR601M
//		productionResultDAO.deleteProductionResultMaterial(dto); // todo

		// 3. 실적 삭제 TPR601
		productionResultDAO.deleteProductionResult(dto);

	}



	@Override
	public ListResult<ProdResultRow> selectProductionResultDetailList(ProdResultDto dto) throws Exception {
		List<ProdResultRow> list = productionResultDAO.selectProductionResultDetailList(dto);

		return new ListResult<>(list, 0);
	}


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

}
