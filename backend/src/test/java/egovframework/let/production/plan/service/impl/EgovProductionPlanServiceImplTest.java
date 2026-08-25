package egovframework.let.production.plan.service.impl;

import egovframework.let.common.idgen.service.EgovConditionalIdService;
import egovframework.let.production.plan.domain.model.ProductionPlanWeeklyDTO;
import egovframework.let.production.plan.domain.model.ProductionPlanVO;
import egovframework.let.production.plan.domain.repository.ProductionPlanDAO;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EgovProductionPlanServiceImplTest {

    @Mock
    private ProductionPlanDAO productionPlanDAO;

    @Mock
    private EgovConditionalIdService egovConditionalIdService;

    @Test
    void selectWeeklyProductionPlans_includesDirectItemMetadataInDailyPlan() throws Exception {
        EgovProductionPlanServiceImpl service = new EgovProductionPlanServiceImpl(
                productionPlanDAO,
                egovConditionalIdService
        );

        Map<String, Object> row = new java.util.LinkedHashMap<>();
        row.put("workplaceCode", "WC001");
        row.put("processCode", "PR096");
        row.put("processName", "W.E 공정");
        row.put("equipmentCode", "WE007");
        row.put("equipmentName", "WE 7호기");
        row.put("equipmentId", "EQ066");
        row.put("prodplanId", "PL202608250031");
        row.put("planDate", "20260825");
        row.put("planSeq", 2);
        row.put("prodworkSeq", 1);
        row.put("itemCode", "49098");
        row.put("itemDisplayCode", "ERSA-37537");
        row.put("itemName", "VERIFY_DIRECT_ITEM");
        row.put("plannedQty", 1200);
        row.put("actualQty", 0);
        row.put("shift", "A");
        row.put("planGroupId", "PL202608250031");
        row.put("groupSeq", 1);
        row.put("createDays", 3);
        row.put("totalGroupCount", 3);
        row.put("itemInputType", "DIRECT");
        row.put("directGroupId", "DBG-VERIFY-001");
        row.put("orderFlag", "PLANNED");
        row.put("remark", "verify_direct_group");
        row.put("hasResult", 0);

        ProductionPlanVO searchVO = new ProductionPlanVO();
        searchVO.setWorkplaceCode("WC001");
        when(productionPlanDAO.selectWeeklyProductionPlansByWorkplace(searchVO)).thenReturn(Collections.singletonList(row));

        Map<String, Object> result = service.selectWeeklyProductionPlans(searchVO);

        List<ProductionPlanWeeklyDTO.EquipmentWeeklyPlan> equipmentPlans =
                (List<ProductionPlanWeeklyDTO.EquipmentWeeklyPlan>) result.get("equipmentPlans");

        assertThat(equipmentPlans).hasSize(1);
        assertThat(equipmentPlans.get(0).getWeeklyPlans())
                .containsKey("2026-08-25");
        assertThat(equipmentPlans.get(0).getWeeklyPlans().get("2026-08-25").get(0).getItemInputType())
                .isEqualTo("DIRECT");
        assertThat(equipmentPlans.get(0).getWeeklyPlans().get("2026-08-25").get(0).getDirectGroupId())
                .isEqualTo("DBG-VERIFY-001");
    }
}
