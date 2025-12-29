package egovframework.let.basedata.equipment.controller;

import egovframework.com.cmm.LoginVO;
import egovframework.com.cmm.ResponseCode;
import egovframework.com.cmm.service.ResultVO;
import egovframework.com.cmm.util.ResultVoHelper;
import egovframework.let.basedata.equipment.domain.model.Equipment;
import egovframework.let.basedata.equipment.domain.model.EquipmentVO;
import egovframework.let.basedata.equipment.service.EgovEquipmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.egovframe.rte.fdl.property.EgovPropertyService;
import org.egovframe.rte.ptl.mvc.tags.ui.pagination.PaginationInfo;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 설비 관리를 위한 컨트롤러 클래스
 * @author SHMT-MES
 * @since 2025.11.12
 * @version 1.0
 * @see
 *
 * <pre>
 * << 개정이력(Modification Information) >>
 *
 *   수정일      수정자           수정내용
 *  -------    --------    ---------------------------
 *   2025.11.12 SHMT-MES          최초 생성
 *
 * </pre>
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
@Tag(name="EgovEquipmentApiController", description = "설비 관리")
public class EgovEquipmentApiController {

    private final ResultVoHelper resultVoHelper;
    private final EgovEquipmentService equipmentService;
    private final EgovPropertyService propertyService;

    /**
     * 설비 목록을 조회한다.
     */
    @Operation(
            summary = "설비 목록 조회",
            description = "설비 목록을 조회한다",
            security = {@SecurityRequirement(name = "Authorization")},
            tags = {"EgovEquipmentApiController"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
    })
    @GetMapping("/equipments")
    public ResultVO selectEquipmentList(
            @ModelAttribute EquipmentVO equipmentVO,
            @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user) throws Exception {

        PaginationInfo paginationInfo = new PaginationInfo();
        paginationInfo.setCurrentPageNo(equipmentVO.getPageIndex());
        paginationInfo.setRecordCountPerPage(
                equipmentVO.getPageUnit() > 0 ? equipmentVO.getPageUnit() : propertyService.getInt("Globals.pageUnit")
        );
        paginationInfo.setPageSize(propertyService.getInt("Globals.pageSize"));

        equipmentVO.setFirstIndex(paginationInfo.getFirstRecordIndex());
        equipmentVO.setLastIndex(paginationInfo.getLastRecordIndex());
        equipmentVO.setRecordCountPerPage(paginationInfo.getRecordCountPerPage());

        Map<String, Object> resultMap = equipmentService.selectEquipmentList(equipmentVO);
        int totCnt = Integer.parseInt((String)resultMap.get("resultCnt"));
        paginationInfo.setTotalRecordCount(totCnt);
        
        resultMap.put("equipmentVO", equipmentVO);
        resultMap.put("paginationInfo", paginationInfo);
        resultMap.put("user", user);

        return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
    }

    /**
     * 설비 상세 정보를 조회한다.
     */
    @Operation(
            summary = "설비 상세 조회",
            description = "설비 상세 정보를 조회한다",
            security = {@SecurityRequirement(name = "Authorization")},
            tags = {"EgovEquipmentApiController"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
    })
    @GetMapping("/equipments/{equipmentId}")
    public ResultVO selectEquipment(
            @PathVariable String equipmentId,
            @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user) throws Exception {

        Equipment equipment = equipmentService.selectEquipment(equipmentId);
        
        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("equipment", equipment);
        resultMap.put("user", user);

        return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
    }

    /**
     * 설비를 등록한다.
     */
    @Operation(
            summary = "설비 등록",
            description = "설비를 등록한다",
            security = {@SecurityRequirement(name = "Authorization")},
            tags = {"EgovEquipmentApiController"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "등록 성공"),
            @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
    })
    @PostMapping("/equipments")
    public ResultVO insertEquipment(
            @RequestBody Equipment equipment,
            @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user) throws Exception {

        // 설비 코드 중복 체크
        if (equipmentService.isEquipmentCodeExists(equipment.getEquipSysCd(), equipment.getEquipCd())) {
            Map<String, Object> errorMap = new HashMap<>();
            errorMap.put("message", "이미 존재하는 설비 코드입니다.");
            errorMap.put("duplicateField", "equipCd");
            errorMap.put("duplicateValue", equipment.getEquipCd());

            return resultVoHelper.buildFromMap(errorMap, ResponseCode.INPUT_CHECK_ERROR);
        }

        equipment.setRegUserId(user.getUniqId());
        equipmentService.insertEquipment(equipment);

        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("message", "설비가 성공적으로 등록되었습니다.");
        resultMap.put("user", user);

        return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
    }

    /**
     * 설비를 수정한다.
     */
    @Operation(
            summary = "설비 수정",
            description = "설비를 수정한다",
            security = {@SecurityRequirement(name = "Authorization")},
            tags = {"EgovEquipmentApiController"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "수정 성공"),
            @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
    })
    @PutMapping("/equipments/{equipCd}")
    public ResultVO updateEquipment(
            @PathVariable String equipCd,
            @RequestBody Equipment equipment,
            @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user) throws Exception {

        equipment.setEquipCd(equipCd);
        equipment.setUpdUserId(user.getUniqId());
        equipmentService.updateEquipment(equipment);

        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("message", "설비가 성공적으로 수정되었습니다.");
        resultMap.put("user", user);

        return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
    }

    /**
     * 설비를 삭제한다.
     */
    @Operation(
            summary = "설비 삭제",
            description = "설비를 삭제한다",
            security = {@SecurityRequirement(name = "Authorization")},
            tags = {"EgovEquipmentApiController"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "삭제 성공"),
            @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
    })
    @DeleteMapping("/equipments/{equipmentId}")
    public ResultVO deleteEquipment(
            @PathVariable String equipmentId,
            @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user) throws Exception {

        equipmentService.deleteEquipment(equipmentId);

        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("message", "설비가 성공적으로 삭제되었습니다.");
        resultMap.put("user", user);

        return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
    }



    /**
     * 작업장 별 설비 목록을 조회한다.
     */
    @Operation(
            summary = "작업장별 설비 목록 조회",
            description = "작업장별 설비 목록을 조회한다",
            security = {@SecurityRequirement(name = "Authorization")},
            tags = {"EgovEquipmentApiController"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
    })
    @GetMapping("/equipments/wokrplace/{wokrplaceId}")
    public ResultVO selectEquipmentsByWorkplaceId(
            @PathVariable String wokrplaceId,
            @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user) throws Exception {

        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("user", user);

        List<Map<String, Object>> resultList = equipmentService.selectEquipmentListByWorkplaceCode(wokrplaceId);
        resultMap.put("resultList", resultList);

        return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
    }


}
