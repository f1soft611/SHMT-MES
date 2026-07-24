package egovframework.let.production.order.service.impl;

import egovframework.let.common.dto.ListResult;
import egovframework.let.common.idgen.service.EgovConditionalIdService;
import egovframework.let.production.order.domain.model.ProdOrderInsertDto;
import egovframework.let.production.order.domain.model.ProdOrderRow;
import egovframework.let.production.order.domain.model.ProdOrderSearchParam;
import egovframework.let.production.order.domain.model.ProdPlanLotNoDto;
import egovframework.let.production.order.domain.repository.ProductionOrderDAO;
import egovframework.let.production.order.service.ErpIFProdOrderService;
import egovframework.let.scheduler.service.ErpToMesInterfaceService;
import egovframework.let.production.order.domain.model.ProdOrderInsertDto;
import egovframework.let.production.order.domain.model.ProdPlanLotNoDto;
import org.mockito.ArgumentCaptor;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InOrder;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EgovProductionOrderServiceImplTest {

    @Mock
    private ProductionOrderDAO productionOrderDAO;

    @Mock
    private ErpIFProdOrderService erpIfService;

    @Mock
    private EgovConditionalIdService egovConditionalIdService;

    @Mock
    private ErpToMesInterfaceService erpToMesInterfaceService;

    @Test
    void selectFlowProcessByPlanId_resyncsEachRootItemBeforeQuerying() throws Exception {
        EgovProductionOrderServiceImpl service = new EgovProductionOrderServiceImpl(
                productionOrderDAO, erpIfService, egovConditionalIdService, erpToMesInterfaceService);

        ProdOrderSearchParam param = new ProdOrderSearchParam();
        param.setProdplanDate("20260723");
        param.setProdplanSeq(1);
        param.setProdworkSeq(1);

        when(productionOrderDAO.selectRootItemCodesByPlan(param)).thenReturn(Arrays.asList(100, 200));
        List<ProdOrderRow> rows = Collections.singletonList(new ProdOrderRow());
        when(productionOrderDAO.selectFlowProcessByPlanId(param)).thenReturn(rows);

        ListResult<ProdOrderRow> result = service.selectFlowProcessByPlanId(param);

        InOrder inOrder = inOrder(erpToMesInterfaceService, productionOrderDAO);
        inOrder.verify(erpToMesInterfaceService).resyncTPDROUItemProcMatByRootItem(eq(100));
        inOrder.verify(erpToMesInterfaceService).resyncTPDROUItemProcMatByRootItem(eq(200));
        inOrder.verify(productionOrderDAO).selectFlowProcessByPlanId(param);

        assertThat(result.getResultList()).isEqualTo(rows);
        assertThat(result.getResultCnt()).isZero();
    }

    @Test
    void insertProductionOrders_updatesPlanWithThePlanProcessLotNo() throws Exception {
        EgovProductionOrderServiceImpl service = new EgovProductionOrderServiceImpl(
                productionOrderDAO, erpIfService, egovConditionalIdService, erpToMesInterfaceService);

        ProdOrderInsertDto normalProcess = order("N", "NORMAL-LOT");
        ProdOrderInsertDto planProcess = order("Y", "PLAN-LOT");

        when(productionOrderDAO.selectProdOrderNextId())
                .thenReturn("ORDER-1", "ORDER-2");
        when(productionOrderDAO.selectProdOrderWorkSeq(any(ProdOrderInsertDto.class)))
                .thenReturn(1, 2);
        when(erpIfService.sendProdOrderBatchToErp(any())).thenReturn(true);

        service.insertProductionOrders(Arrays.asList(normalProcess, planProcess));

        ArgumentCaptor<ProdPlanLotNoDto> detailCaptor =
                ArgumentCaptor.forClass(ProdPlanLotNoDto.class);
        ArgumentCaptor<ProdPlanLotNoDto> masterCaptor =
                ArgumentCaptor.forClass(ProdPlanLotNoDto.class);

        verify(productionOrderDAO, times(1)).updateProdPlanLotNo(detailCaptor.capture());
        verify(productionOrderDAO, times(1)).updateProdPlanLotNo2(masterCaptor.capture());

        assertPlanLot(detailCaptor.getValue());
        assertPlanLot(masterCaptor.getValue());
    }

    private ProdOrderInsertDto order(String planFlag, String lotNo) {
        ProdOrderInsertDto dto = new ProdOrderInsertDto();
        dto.setProdplanDate("20260724");
        dto.setProdplanSeq(10);
        dto.setProdworkSeq(20);
        dto.setPlanFlag(planFlag);
        dto.setLotNo(lotNo);
        dto.setLastFlag("N");
        return dto;
    }

    private void assertPlanLot(ProdPlanLotNoDto dto) {
        assertThat(dto.getProdplanDate()).isEqualTo("20260724");
        assertThat(dto.getProdplanSeq()).isEqualTo(10);
        assertThat(dto.getProdworkSeq()).isEqualTo(20);
        assertThat(dto.getLotNo()).isEqualTo("PLAN-LOT");
    }
}