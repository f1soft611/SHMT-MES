package egovframework.let.production.plan.controller;

import egovframework.com.cmm.LoginVO;
import egovframework.com.cmm.ResponseCode;
import egovframework.com.cmm.service.ResultVO;
import egovframework.com.cmm.util.ResultVoHelper;
import egovframework.let.production.plan.domain.model.*;
import egovframework.let.production.plan.service.EgovProductionPlanService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.egovframe.rte.fdl.property.EgovPropertyService;
import org.egovframe.rte.ptl.mvc.tags.ui.pagination.PaginationInfo;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 생산계획을 관리하기 위한 컨트롤러 클래스
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
@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
@Tag(name="EgovProductionPlanApiController", description = "생산계획 관리")
public class EgovProductionPlanApiController {

	private final ResultVoHelper resultVoHelper;
	private final EgovProductionPlanService productionPlanService;
	private final EgovPropertyService propertyService;

	/**
	 * 생산계획 목록을 조회한다.
	 *
	 * @param searchVO 검색 조건
	 * @param user 사용자 정보
	 * @return ResultVO
	 * @throws Exception
	 */
	@Operation(
			summary = "생산계획 목록 조회",
			description = "생산계획 목록을 조회한다.",
			security = {@SecurityRequirement(name = "Authorization")},
			tags = {"EgovProductionPlanApiController"}
	)
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "조회 성공"),
			@ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
	})
	@GetMapping(value = "/production-plans")
	public ResultVO selectProductionPlanList(
			@ModelAttribute ProductionPlanVO searchVO,
			@Parameter(hidden = true) @AuthenticationPrincipal LoginVO user) throws Exception {

		Map<String, Object> resultMap = productionPlanService.selectProductionPlanMasterList(searchVO, user);

		return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
	}

	/**
	 * 생산계획 상세 목록을 조회한다.
	 *
	 * @param planNo 계획번호
	 * @param user 사용자 정보
	 * @return ResultVO
	 * @throws Exception
	 */
	@Operation(
			summary = "생산계획 상세 조회",
			description = "계획번호로 생산계획 상세 목록을 조회한다.",
			security = {@SecurityRequirement(name = "Authorization")},
			tags = {"EgovProductionPlanApiController"}
	)
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "조회 성공"),
			@ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
	})
	@GetMapping(value = "/production-plans/{planNo}")
	public ResultVO selectProductionPlanByPlanNo(
			@PathVariable("planNo") String planNo,
			@Parameter(hidden = true) @AuthenticationPrincipal LoginVO user) throws Exception {

		List<ProductionPlan> planList = productionPlanService.selectProductionPlanByPlanNo(planNo);

		Map<String, Object> resultMap = new HashMap<>();
		resultMap.put("planList", planList);
		resultMap.put("user", user);

		return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
	}

	/**
	 * 생산계획을 등록한다. (마스터 + 상세 트랜잭션 처리)
	 *
	 * @param requestBody 생산계획 등록 요청 정보
	 * @param user 사용자 정보
	 * @return ResultVO
	 * @throws Exception
	 */
	@Operation(
			summary = "생산계획 등록",
			description = "생산계획을 등록한다. (TPR301M, TPR301 테이블에 트랜잭션 처리)",
			security = {@SecurityRequirement(name = "Authorization")},
			tags = {"EgovProductionPlanApiController"}
	)
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "등록 성공"),
			@ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
	})
	@PostMapping(value = "/production-plans")
	public ResultVO insertProductionPlan(
			@RequestBody ProductionPlanRequest requestBody,
			@Parameter(hidden = true) @AuthenticationPrincipal LoginVO user) throws Exception {

		// 마스터 정보 설정
		ProductionPlanMaster master = requestBody.getMaster();
		master.setFactoryCode(user.getFactoryCode());
		master.setOpmanCode(user.getUniqId());

		// 상세 정보 설정
		List<ProductionPlan> planList = requestBody.getDetails();
		for (ProductionPlan plan : planList) {
			plan.setFactoryCode(user.getFactoryCode());
			plan.setOpmanCode(user.getUniqId());
		}

		// 참조 정보 가져오기
		List<ProductionPlanReference> references = requestBody.getReferences();

		// 생산계획 등록 (트랜잭션 처리)
		String planId = productionPlanService.insertProductionPlan(master, planList, references);

		Map<String, Object> resultMap = new HashMap<>();
		resultMap.put("message", "생산계획이 등록되었습니다.");
		resultMap.put("planId", planId);
		resultMap.put("user", user);

		return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
	}

	/**
	 * 생산계획을 수정한다.
	 *
	 * @param planNo 계획번호
	 * @param requestBody 생산계획 수정 요청 정보
	 * @param user 사용자 정보
	 * @return ResultVO
	 * @throws Exception
	 */
	@Operation(
			summary = "생산계획 수정",
			description = "생산계획을 수정한다.",
			security = {@SecurityRequirement(name = "Authorization")},
			tags = {"EgovProductionPlanApiController"}
	)
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "수정 성공"),
			@ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
	})
	@PutMapping(value = "/production-plans/{planNo}")
	public ResultVO updateProductionPlan(
			@PathVariable("planNo") String planNo,
			@RequestBody ProductionPlanRequest requestBody,
			@Parameter(hidden = true) @AuthenticationPrincipal LoginVO user) throws Exception {

		// 마스터 정보 설정
		ProductionPlanMaster master = requestBody.getMaster();
		master.setProdPlanId(planNo);
		master.setOpmanCode2(user.getUniqId());

		// 상세 정보 설정
		List<ProductionPlan> planList = requestBody.getDetails();
		for (ProductionPlan plan : planList) {
			plan.setProdPlanId(planNo);
			plan.setOpmanCode2(user.getUniqId());
		}

		// 생산계획 수정 (트랜잭션 처리)
		productionPlanService.updateProductionPlan(master, planList);

		Map<String, Object> resultMap = new HashMap<>();
		resultMap.put("message", "생산계획이 수정되었습니다.");
		resultMap.put("user", user);

		return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
	}

	/**
	 * 생산계획을 삭제한다.
	 *
	 * @param planNo 계획번호
	 * @param user 사용자 정보
	 * @return ResultVO
	 * @throws Exception
	 */
	@Operation(
			summary = "생산계획 삭제",
			description = "생산계획을 삭제한다.",
			security = {@SecurityRequirement(name = "Authorization")},
			tags = {"EgovProductionPlanApiController"}
	)
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "삭제 성공"),
			@ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
	})
	@DeleteMapping(value = "/production-plans/{planNo}")
	public ResultVO deleteProductionPlan(
			@PathVariable("planNo") String planNo,
			@Parameter(hidden = true) @AuthenticationPrincipal LoginVO user) throws Exception {

		// 마스터 정보 설정
		ProductionPlanMaster master = new ProductionPlanMaster();
		master.setProdPlanId(planNo);
		master.setOpmanCode2(user.getUniqId());

		// 생산계획 삭제 (마스터 삭제 시 상세도 함께 삭제)
		productionPlanService.deleteProductionPlan(master);

		Map<String, Object> resultMap = new HashMap<>();
		resultMap.put("message", "생산계획이 삭제되었습니다.");
		resultMap.put("user", user);

		return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
	}

	/**
	 * 작업장별 주간 생산계획을 조회한다. (설비별 그룹화)
	 *
	 * @param workplaceCode 작업장 코드
	 * @param startDate 시작일자 (YYYYMMDD)
	 * @param endDate 종료일자 (YYYYMMDD)
	 * @param user 사용자 정보
	 * @return ResultVO
	 * @throws Exception
	 */
	@Operation(
			summary = "주간 생산계획 조회 (설비별 그룹화)",
			description = "작업장별 주간 생산계획을 설비별로 그룹화하여 조회한다.",
			security = {@SecurityRequirement(name = "Authorization")},
			tags = {"EgovProductionPlanApiController"}
	)
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "조회 성공"),
			@ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
	})
	@GetMapping(value = "/production-plans/weekly")
	public ResultVO selectWeeklyProductionPlans(
			@RequestParam("workplaceCode") String workplaceCode,
			@RequestParam("startDate") String startDate,
			@RequestParam("endDate") String endDate,
			@Parameter(hidden = true) @AuthenticationPrincipal LoginVO user) throws Exception {

		// 검색 조건 설정
		ProductionPlanVO searchVO = new ProductionPlanVO();
		searchVO.setWorkplaceCode(workplaceCode);
		searchVO.setStartDate(startDate);
		searchVO.setEndDate(endDate);

		// 주간 계획 조회
		Map<String, Object> resultMap = productionPlanService.selectWeeklyProductionPlans(searchVO);
		resultMap.put("user", user);

		return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
	}

	/**
	 * 생산의뢰(TSA308) 목록을 조회한다.
	 *
	 * @param searchVO 검색 조건
	 * @param user 사용자 정보
	 * @return ResultVO
	 * @throws Exception
	 */
	@Operation(
			summary = "생산의뢰 목록 조회",
			description = "TSA308 테이블에서 생산의뢰 목록을 조회한다.",
			security = {@SecurityRequirement(name = "Authorization")},
			tags = {"EgovProductionPlanApiController"}
	)
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "조회 성공"),
			@ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
	})
	@GetMapping(value = "/production-requests")
	public ResultVO selectProductionRequestList(
			@ModelAttribute ProductionRequestVO searchVO,
			@Parameter(hidden = true) @AuthenticationPrincipal LoginVO user) throws Exception {

		PaginationInfo paginationInfo = new PaginationInfo();
		paginationInfo.setCurrentPageNo(searchVO.getPageIndex());
		paginationInfo.setRecordCountPerPage(
				searchVO.getPageUnit() > 0 ? searchVO.getPageUnit() : propertyService.getInt("Globals.pageUnit")
		);
		paginationInfo.setPageSize(propertyService.getInt("Globals.pageSize"));

		searchVO.setFactoryCode(user.getFactoryCode());
		searchVO.setFirstIndex(paginationInfo.getFirstRecordIndex());
		searchVO.setLastIndex(paginationInfo.getLastRecordIndex());
		searchVO.setRecordCountPerPage(paginationInfo.getRecordCountPerPage());

		Map<String, Object> resultMap = productionPlanService.selectProductionRequestList(searchVO, user);
		int totCnt = Integer.parseInt((String)resultMap.get("resultCnt"));
		paginationInfo.setTotalRecordCount(totCnt);

		resultMap.put("productionRequestVO", searchVO);
		resultMap.put("paginationInfo", paginationInfo);
		resultMap.put("user", user);

		return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
	}

	/**
	 * 생산계획 등록/수정 요청 클래스
	 */
	@Getter
	@Setter
	public static class ProductionPlanRequest {
		private ProductionPlanMaster master;
		private List<ProductionPlan> details;
		private List<ProductionPlanReference> references;
	}
}
