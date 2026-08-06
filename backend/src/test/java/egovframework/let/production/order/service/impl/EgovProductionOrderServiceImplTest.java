package egovframework.let.production.order.service.impl;

import egovframework.com.cmm.exception.BizException;
import egovframework.let.common.dto.ListResult;
import egovframework.let.common.idgen.service.EgovConditionalIdService;
import egovframework.let.production.order.domain.model.*;
import egovframework.let.production.order.domain.repository.ProductionOrderDAO;
import egovframework.let.production.order.service.ErpIFProdOrderService;
import egovframework.let.scheduler.service.ErpToMesInterfaceService;
import org.mockito.ArgumentCaptor;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InOrder;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.when;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;

import java.lang.reflect.Method;
import org.springframework.transaction.annotation.Transactional;

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
    void bulkCreateProductionOrders_resyncsBomForEachPlan() throws Exception {
        EgovProductionOrderServiceImpl service = new EgovProductionOrderServiceImpl(
                productionOrderDAO, erpIfService, egovConditionalIdService, erpToMesInterfaceService);

        ProdPlanKeyDto plan = new ProdPlanKeyDto();
        plan.setProdplanDate("20260724");
        plan.setProdplanSeq(1);
        plan.setProdworkSeq(1);
        plan.setProdplanDetailId("DETAIL-1");

        ProdOrderRow row = new ProdOrderRow();
        row.setProdplanDate("20260724");
        row.setProdplanSeq(1);
        row.setProdworkSeq(1);
        row.setTpr110dSeq(1);

        when(productionOrderDAO.selectRootItemCodesByPlan(any(ProdOrderSearchParam.class)))
                .thenReturn(Collections.singletonList(100));
        when(productionOrderDAO.selectFlowProcessByPlanId(any(ProdOrderSearchParam.class)))
                .thenReturn(Collections.singletonList(row));

        service.bulkCreateProductionOrders(Collections.singletonList(plan));

        verify(erpToMesInterfaceService).resyncTPDROUItemProcMatByRootItem(eq(100));
    }

    @Test
    void bulkCreateProductionOrders_propagatesResyncFailure() throws Exception {
        EgovProductionOrderServiceImpl service = new EgovProductionOrderServiceImpl(
                productionOrderDAO, erpIfService, egovConditionalIdService, erpToMesInterfaceService);

        ProdPlanKeyDto plan = new ProdPlanKeyDto();
        plan.setProdplanDate("20260724");
        plan.setProdplanSeq(1);
        plan.setProdworkSeq(1);

        when(productionOrderDAO.selectRootItemCodesByPlan(any(ProdOrderSearchParam.class)))
                .thenReturn(Collections.singletonList(100));
        doThrow(new RuntimeException("ERP down"))
                .when(erpToMesInterfaceService).resyncTPDROUItemProcMatByRootItem(100);

        assertThatThrownBy(() -> service.bulkCreateProductionOrders(Collections.singletonList(plan)))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("ERP down");

        verify(productionOrderDAO, never()).insertProductionOrder(any());
    }

    @Test
    void bulkCreateProductionOrders_rollsBackOnCheckedExceptionsToo() throws Exception {
        Method method = EgovProductionOrderServiceImpl.class
                .getMethod("bulkCreateProductionOrders", List.class);

        Transactional annotation = method.getAnnotation(Transactional.class);

        assertThat(annotation).isNotNull();
        assertThat(annotation.rollbackFor()).contains((Class) Exception.class);
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

    @Test
    void bulkCreateProductionOrders_updatesEachPlanWithItsPlanProcessLotNo() throws Exception {
        EgovProductionOrderServiceImpl service = new EgovProductionOrderServiceImpl(
                productionOrderDAO, erpIfService, egovConditionalIdService, erpToMesInterfaceService);

        ProdPlanKeyDto firstPlan = bulkPlan("20260724", 1, 11, "DETAIL-1");
        ProdPlanKeyDto secondPlan = bulkPlan("20260725", 2, 22, "DETAIL-2");

        List<ProdOrderRow> firstTargets = Arrays.asList(
                bulkRow("20260724", 1, 11, "NORMAL-1", "N", 1),
                bulkRow("20260724", 1, 11, "PLAN-1", "Y", 2)
        );
        List<ProdOrderRow> secondTargets = Arrays.asList(
                bulkRow("20260725", 2, 22, "NORMAL-2", "N", 1),
                bulkRow("20260725", 2, 22, "PLAN-2", "Y", 2)
        );

        when(productionOrderDAO.selectFlowProcessByPlanId(any(ProdOrderSearchParam.class)))
                .thenReturn(firstTargets, secondTargets);
        stubBulkInfrastructure(
                "NORMAL-LOT-1",
                "PLAN-LOT-1",
                "NORMAL-LOT-2",
                "PLAN-LOT-2"
        );

        boolean erpIfFailed = service.bulkCreateProductionOrders(
                Arrays.asList(firstPlan, secondPlan));

        ArgumentCaptor<ProdPlanLotNoDto> detailCaptor =
                ArgumentCaptor.forClass(ProdPlanLotNoDto.class);
        ArgumentCaptor<ProdPlanLotNoDto> masterCaptor =
                ArgumentCaptor.forClass(ProdPlanLotNoDto.class);

        verify(productionOrderDAO, times(2)).updateProdPlanLotNo(detailCaptor.capture());
        verify(productionOrderDAO, times(2)).updateProdPlanLotNo2(masterCaptor.capture());

        assertPlanLot(detailCaptor.getAllValues().get(0),
                "20260724", 1, 11, "PLAN-LOT-1");
        assertPlanLot(detailCaptor.getAllValues().get(1),
                "20260725", 2, 22, "PLAN-LOT-2");
        assertPlanLot(masterCaptor.getAllValues().get(0),
                "20260724", 1, 11, "PLAN-LOT-1");
        assertPlanLot(masterCaptor.getAllValues().get(1),
                "20260725", 2, 22, "PLAN-LOT-2");
        assertThat(erpIfFailed).isFalse();
    }

    @Test
    void bulkCreateProductionOrders_skipsPlanLotUpdateWhenPlanFlagIsMissing() throws Exception {
        EgovProductionOrderServiceImpl service = new EgovProductionOrderServiceImpl(
                productionOrderDAO, erpIfService, egovConditionalIdService, erpToMesInterfaceService);

        ProdPlanKeyDto plan = bulkPlan("20260724", 3, 33, "DETAIL-3");
        List<ProdOrderRow> targets = Collections.singletonList(
                bulkRow("20260724", 3, 33, "NORMAL-3", "N", 1)
        );

        when(productionOrderDAO.selectFlowProcessByPlanId(any(ProdOrderSearchParam.class)))
                .thenReturn(targets);
        stubBulkInfrastructure("NORMAL-LOT-3");

        service.bulkCreateProductionOrders(Collections.singletonList(plan));

        verify(productionOrderDAO, never()).updateProdPlanLotNo(any(ProdPlanLotNoDto.class));
        verify(productionOrderDAO, never()).updateProdPlanLotNo2(any(ProdPlanLotNoDto.class));
    }

    @Test
    void bulkCreateProductionOrders_updatesPlanLotWhenErpIfFails() throws Exception {
        EgovProductionOrderServiceImpl service = new EgovProductionOrderServiceImpl(
                productionOrderDAO, erpIfService, egovConditionalIdService, erpToMesInterfaceService);

        ProdPlanKeyDto plan = bulkPlan("20260724", 4, 44, "DETAIL-4");
        List<ProdOrderRow> targets = Collections.singletonList(
                bulkRow("20260724", 4, 44, "PLAN-4", "Y", 1)
        );

        when(productionOrderDAO.selectFlowProcessByPlanId(any(ProdOrderSearchParam.class)))
                .thenReturn(targets);
        stubBulkInfrastructure("PLAN-LOT-4");
        when(erpIfService.sendProdOrderBatchToErp(any())).thenReturn(false);

        boolean erpIfFailed = service.bulkCreateProductionOrders(
                Collections.singletonList(plan));

        ArgumentCaptor<ProdPlanLotNoDto> captor =
                ArgumentCaptor.forClass(ProdPlanLotNoDto.class);
        verify(productionOrderDAO).updateProdPlanLotNo(captor.capture());
        verify(productionOrderDAO).updateProdPlanLotNo2(any(ProdPlanLotNoDto.class));
        assertPlanLot(captor.getValue(), "20260724", 4, 44, "PLAN-LOT-4");
        assertThat(erpIfFailed).isTrue();
    }

    @Test
    void deleteProductionOrder_sendsErpIfOnlyForLastFlagRows() throws Exception {
        EgovProductionOrderServiceImpl service = new EgovProductionOrderServiceImpl(
                productionOrderDAO, erpIfService, egovConditionalIdService, erpToMesInterfaceService);

        ProdOrderDeleteDto dto = new ProdOrderDeleteDto();
        dto.setProdplanDate("20260805");
        dto.setProdplanSeq(1);
        dto.setProdworkSeq(1);

        ProdOrderRow lastProcessRow = new ProdOrderRow();
        lastProcessRow.setProdplanDate("20260805");
        lastProcessRow.setProdplanSeq(1);
        lastProcessRow.setProdworkSeq(1);
        lastProcessRow.setProdorderId("ORDER-LAST");
        lastProcessRow.setLastFlag("Y");
        lastProcessRow.setErpWorkOrderSeq(501);
        lastProcessRow.setErpWorkOrderSerl(1);

        ProdOrderRow normalProcessRow = new ProdOrderRow();
        normalProcessRow.setProdplanDate("20260805");
        normalProcessRow.setProdplanSeq(1);
        normalProcessRow.setProdworkSeq(1);
        normalProcessRow.setProdorderId("ORDER-NORMAL");
        normalProcessRow.setLastFlag("N");

        when(productionOrderDAO.selectProdResultCount(any(ProdOrderDeleteDto.class))).thenReturn(0);
        when(productionOrderDAO.selectProdOrdersByPlanId(any(ProdOrderSearchParam.class)))
                .thenReturn(Arrays.asList(lastProcessRow, normalProcessRow));
        when(erpIfService.sendProdOrderToErp(any())).thenReturn(true);

        service.deleteProductionOrder(dto);

        ArgumentCaptor<ErpIFProdOrderDto> erpCaptor = ArgumentCaptor.forClass(ErpIFProdOrderDto.class);
        verify(erpIfService, times(1)).sendProdOrderToErp(erpCaptor.capture());
        assertThat(erpCaptor.getValue().getMesIfKey()).isEqualTo("ORDER-LAST");
        assertThat(erpCaptor.getValue().getWorkingTag()).isEqualTo("D");
        assertThat(erpCaptor.getValue().getWorkOrderSeq()).isEqualTo(501);
        assertThat(erpCaptor.getValue().getWorkOrderSerl()).isEqualTo(1);

        verify(productionOrderDAO, times(2)).deleteReqProductionOrder(any(ProdOrderDeleteDto.class));
    }

    @Test
    void deleteProductionOrder_throwsWhenLastFlagRowMissingErpWorkOrderValues() throws Exception {
        EgovProductionOrderServiceImpl service = new EgovProductionOrderServiceImpl(
                productionOrderDAO, erpIfService, egovConditionalIdService, erpToMesInterfaceService);

        ProdOrderDeleteDto dto = new ProdOrderDeleteDto();
        dto.setProdplanDate("20260805");
        dto.setProdplanSeq(1);
        dto.setProdworkSeq(1);

        ProdOrderRow neverSyncedRow = new ProdOrderRow();
        neverSyncedRow.setProdplanDate("20260805");
        neverSyncedRow.setProdplanSeq(1);
        neverSyncedRow.setProdworkSeq(1);
        neverSyncedRow.setProdorderId("ORDER-NEVER-SYNCED");
        neverSyncedRow.setLastFlag("Y");
        neverSyncedRow.setLotNo("LOT-NEVER-SYNCED");
        // erpWorkOrderSeq / erpWorkOrderSerl 미설정 (null) = ERP 미연동 상태 -> 취소 불가

        when(productionOrderDAO.selectProdResultCount(any(ProdOrderDeleteDto.class))).thenReturn(0);
        when(productionOrderDAO.selectProdOrdersByPlanId(any(ProdOrderSearchParam.class)))
                .thenReturn(Collections.singletonList(neverSyncedRow));

        assertThatThrownBy(() -> service.deleteProductionOrder(dto))
                .isInstanceOf(BizException.class)
                .hasMessageContaining("LOT-NEVER-SYNCED");

        verify(erpIfService, never()).sendProdOrderToErp(any());
        verify(productionOrderDAO, never()).deleteReqProductionOrder(any(ProdOrderDeleteDto.class));
    }

    @Test
    void deleteProductionOrder_throwsWhenLastFlagRowHasZeroErpWorkOrderValues() throws Exception {
        EgovProductionOrderServiceImpl service = new EgovProductionOrderServiceImpl(
                productionOrderDAO, erpIfService, egovConditionalIdService, erpToMesInterfaceService);

        ProdOrderDeleteDto dto = new ProdOrderDeleteDto();
        dto.setProdplanDate("20260805");
        dto.setProdplanSeq(1);
        dto.setProdworkSeq(1);

        ProdOrderRow zeroValueRow = new ProdOrderRow();
        zeroValueRow.setProdplanDate("20260805");
        zeroValueRow.setProdplanSeq(1);
        zeroValueRow.setProdworkSeq(1);
        zeroValueRow.setProdorderId("ORDER-ZERO");
        zeroValueRow.setLastFlag("Y");
        zeroValueRow.setErpWorkOrderSeq(0);
        zeroValueRow.setErpWorkOrderSerl(0);
        zeroValueRow.setLotNo("LOT-ZERO");

        when(productionOrderDAO.selectProdResultCount(any(ProdOrderDeleteDto.class))).thenReturn(0);
        when(productionOrderDAO.selectProdOrdersByPlanId(any(ProdOrderSearchParam.class)))
                .thenReturn(Collections.singletonList(zeroValueRow));

        assertThatThrownBy(() -> service.deleteProductionOrder(dto))
                .isInstanceOf(BizException.class)
                .hasMessageContaining("LOT-ZERO");

        verify(erpIfService, never()).sendProdOrderToErp(any());
        verify(productionOrderDAO, never()).deleteReqProductionOrder(any(ProdOrderDeleteDto.class));
    }

    @Test
    void syncErpResult_revertsPlanToPlannedWhenNoOrdersRemain() throws Exception {
        EgovProductionOrderServiceImpl service = new EgovProductionOrderServiceImpl(
                productionOrderDAO, erpIfService, egovConditionalIdService, erpToMesInterfaceService);

        ProdPlanKeyDto plan = bulkPlan("20260805", 1, 1, "DETAIL-1");

        when(productionOrderDAO.selectProdorderIdsByPlanKey(plan))
                .thenReturn(Collections.singletonList("ORDER-DELETED"));

        ErpIFProdOrderResultDto result = new ErpIFProdOrderResultDto();
        result.setMesIfKey("ORDER-DELETED");
        when(erpIfService.selectErpResultByMesIfKeys(anyList()))
                .thenReturn(Collections.singletonList(result));
        when(productionOrderDAO.updateErpResultByProdorderId(result)).thenReturn(1);

        ProdPlanKeyDto planKey = new ProdPlanKeyDto();
        planKey.setProdplanDate("20260805");
        planKey.setProdplanSeq(1);
        planKey.setProdworkSeq(1);
        when(productionOrderDAO.selectProdPlanKeyByProdorderId("ORDER-DELETED")).thenReturn(planKey);
        when(productionOrderDAO.selectProdorderIdsByPlanKey(planKey)).thenReturn(Collections.emptyList());

        int updated = service.syncErpResult(Collections.singletonList(plan));

        assertThat(updated).isEqualTo(1);

        ArgumentCaptor<ProdPlanOrderFlagDto> flagCaptor = ArgumentCaptor.forClass(ProdPlanOrderFlagDto.class);
        verify(productionOrderDAO).updateProdPlanOrderFlag(flagCaptor.capture());
        verify(productionOrderDAO).updateProdPlanOrderFlag2(any(ProdPlanOrderFlagDto.class));
        assertThat(flagCaptor.getValue().getOrderFlag()).isEqualTo("PLANNED");
        assertThat(flagCaptor.getValue().getProdplanDate()).isEqualTo("20260805");

        ArgumentCaptor<ProdPlanLotNoDto> lotCaptor = ArgumentCaptor.forClass(ProdPlanLotNoDto.class);
        verify(productionOrderDAO).updateProdPlanLotNo(lotCaptor.capture());
        verify(productionOrderDAO).updateProdPlanLotNo2(any(ProdPlanLotNoDto.class));
        assertThat(lotCaptor.getValue().getLotNo()).isEmpty();
    }

    @Test
    void syncErpResult_keepsPlanOrderedWhenOrdersRemain() throws Exception {
        EgovProductionOrderServiceImpl service = new EgovProductionOrderServiceImpl(
                productionOrderDAO, erpIfService, egovConditionalIdService, erpToMesInterfaceService);

        ProdPlanKeyDto plan = bulkPlan("20260805", 2, 2, "DETAIL-2");

        when(productionOrderDAO.selectProdorderIdsByPlanKey(plan))
                .thenReturn(Collections.singletonList("ORDER-A"));

        ErpIFProdOrderResultDto result = new ErpIFProdOrderResultDto();
        result.setMesIfKey("ORDER-A");
        when(erpIfService.selectErpResultByMesIfKeys(anyList()))
                .thenReturn(Collections.singletonList(result));

        ProdPlanKeyDto planKey = new ProdPlanKeyDto();
        planKey.setProdplanDate("20260805");
        planKey.setProdplanSeq(2);
        planKey.setProdworkSeq(2);
        when(productionOrderDAO.selectProdPlanKeyByProdorderId("ORDER-A")).thenReturn(planKey);
        when(productionOrderDAO.selectProdorderIdsByPlanKey(planKey))
                .thenReturn(Arrays.asList("ORDER-A", "ORDER-B"));

        service.syncErpResult(Collections.singletonList(plan));

        verify(productionOrderDAO, never()).updateProdPlanOrderFlag(any(ProdPlanOrderFlagDto.class));
        verify(productionOrderDAO, never()).updateProdPlanLotNo(any(ProdPlanLotNoDto.class));
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

    private ProdPlanKeyDto bulkPlan(String date, int planSeq, int workSeq, String detailId) {
        ProdPlanKeyDto plan = new ProdPlanKeyDto();
        plan.setProdplanDate(date);
        plan.setProdplanSeq(planSeq);
        plan.setProdworkSeq(workSeq);
        plan.setProdplanDetailId(detailId);
        plan.setOrderSeqno(planSeq);
        plan.setOrderHistno(workSeq);
        return plan;
    }

    private ProdOrderRow bulkRow(
            String date,
            int planSeq,
            int workSeq,
            String prodCode,
            String planFlag,
            int processSeq
    ) {
        ProdOrderRow row = new ProdOrderRow();
        row.setProdplanDate(date);
        row.setProdplanSeq(planSeq);
        row.setProdworkSeq(workSeq);
        row.setProdplanId("PLAN-" + planSeq);
        row.setProdCode(prodCode);
        row.setItemCode(prodCode);
        row.setPlanFlag(planFlag);
        row.setLastFlag("N");
        row.setTpr110dSeq(processSeq);
        row.setOrderQty(1);
        row.setItemCtTime(0);
        row.setItemOnePerQty(0);
        return row;
    }

    private void assertPlanLot(
            ProdPlanLotNoDto dto,
            String date,
            int planSeq,
            int workSeq,
            String lotNo
    ) {
        assertThat(dto.getProdplanDate()).isEqualTo(date);
        assertThat(dto.getProdplanSeq()).isEqualTo(planSeq);
        assertThat(dto.getProdworkSeq()).isEqualTo(workSeq);
        assertThat(dto.getLotNo()).isEqualTo(lotNo);
    }

    private void stubBulkInfrastructure(String... lotNos) throws Exception {
        when(productionOrderDAO.selectProdPlanOrderedCount(any(ProdPlanKeyDto.class)))
                .thenReturn(0);

        final int[] lotIndex = {0};
        when(egovConditionalIdService.getNextStringId(
                eq("TPR301M"),
                anyString(),
                anyString(),
                anyString(),
                eq(3),
                eq('0')
        )).thenAnswer(invocation -> lotNos[lotIndex[0]++]);

        when(productionOrderDAO.selectProdOrderNextId())
                .thenReturn("ORDER-1", "ORDER-2", "ORDER-3", "ORDER-4");
        when(productionOrderDAO.selectProdOrderWorkSeq(any(ProdOrderInsertDto.class)))
                .thenReturn(1, 2, 3, 4);
        when(erpIfService.sendProdOrderBatchToErp(any())).thenReturn(true);
    }
}