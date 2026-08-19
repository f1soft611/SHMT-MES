package egovframework.let.scheduler.service.impl;

import egovframework.let.scheduler.domain.model.ErpProductionRequest;
import egovframework.let.scheduler.domain.model.ErpTPDROUItemProcMat;
import egovframework.let.scheduler.domain.repository.MesProdReqInterfaceDAO;
import egovframework.let.scheduler.domain.repository.MesTPDROUItemProcMatInterfaceDAO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InOrder;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ErpToMesInterfaceServiceImplTest {

    @Mock
    private JdbcTemplate erpJdbcTemplate;

    @Mock
    private MesTPDROUItemProcMatInterfaceDAO mesTPDROUItemProcMatInterfaceDAO;

    @Mock
    private MesProdReqInterfaceDAO mesProdReqInterfaceDAO;

    private ErpToMesInterfaceServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new ErpToMesInterfaceServiceImpl();
        ReflectionTestUtils.setField(service, "erpJdbcTemplate", erpJdbcTemplate);
        ReflectionTestUtils.setField(
                service, "mesTPDROUItemProcMatInterfaceDAO", mesTPDROUItemProcMatInterfaceDAO);
        ReflectionTestUtils.setField(service, "mesProdReqInterfaceDAO", mesProdReqInterfaceDAO);
    }

    @Test
    @DisplayName("생산의뢰 연동은 ERP Remark를 MES BIGO로 전달한다")
    void syncProductionRequests_keepsRemarkForMesBigo() throws Exception {
        ErpProductionRequest req = new ErpProductionRequest();
        req.setProdReqNo("PR-1001");
        req.setProdReqSeq(1);
        req.setSerl(1);
        req.setReqDate("20260608");
        req.setCustSeq(10);
        req.setDeptSeq(11);
        req.setEmpSeq(12);
        req.setItemSeq(20);
        req.setItemNo("A100");
        req.setItemName("품목A");
        req.setSpec("SPEC");
        req.setUnitSeq(1);
        req.setQty(BigDecimal.valueOf(3));
        req.setEndDate("20260610");
        req.setDelvDate("20260612");
        req.setRemark("특별지시");
        when(erpJdbcTemplate.query(anyString(), any(RowMapper.class), anyString(), anyString(), anyString(), anyString(), anyString(), anyString()))
                .thenReturn(Collections.singletonList(req));
        when(mesProdReqInterfaceDAO.selectMesProdReqCount(req)).thenReturn(0);

        service.syncProductionRequests("2026-06-01", "2026-06-30");

        ArgumentCaptor<ErpProductionRequest> captor = ArgumentCaptor.forClass(ErpProductionRequest.class);
        verify(mesProdReqInterfaceDAO).insertMesProdReq(captor.capture());
        assertThat(captor.getValue().getRemark()).isEqualTo("특별지시");
    }

    @Test
    @DisplayName("ReqDate 비교용 날짜는 yyyyMMdd로 정규화한다")
    void normalizeReqDateParam_removesHyphen() {
        assertThat(ErpToMesInterfaceServiceImpl.normalizeReqDateParam("2026-06-08")).isEqualTo("20260608");
    }

    @Test
    @DisplayName("ReqDate 비교용 날짜가 이미 yyyyMMdd면 그대로 유지한다")
    void normalizeReqDateParam_keepsCompactDate() {
        assertThat(ErpToMesInterfaceServiceImpl.normalizeReqDateParam("20260608")).isEqualTo("20260608");
    }

    @Test
    @DisplayName("루트 품목 ItemSeq 하나로 재귀 CTE를 실행해 ERP에서 BOM 트리 전체를 한 번에 조회한다")
    void fetchTPDROUItemProcMatByItemSeq_queriesErpWithRecursiveCte() throws Exception {
        List<ErpTPDROUItemProcMat> tree = Arrays.asList(erpRow(100, 20), erpRow(20, 0));
        when(erpJdbcTemplate.query(anyString(), any(RowMapper.class), eq(100)))
                .thenReturn(tree);

        List<ErpTPDROUItemProcMat> result = service.fetchTPDROUItemProcMatByItemSeq(100);

        assertThat(result).isEqualTo(tree);
        verify(erpJdbcTemplate, times(1)).query(anyString(), any(RowMapper.class), eq(100));

        ArgumentCaptor<String> sqlCaptor = ArgumentCaptor.forClass(String.class);
        verify(erpJdbcTemplate).query(sqlCaptor.capture(), any(RowMapper.class), eq(100));
        assertThat(sqlCaptor.getValue()).contains("WITH BOM_TREE AS");
        assertThat(sqlCaptor.getValue()).contains("WHERE T.ItemSeq = ?");
        assertThat(sqlCaptor.getValue()).contains("INNER JOIN dbo.SHM_IF_VIEW_TPDROUItemProcMat AS C ON C.ItemSeq = B.MatItemSeq");
        assertThat(sqlCaptor.getValue()).contains("OPTION (MAXRECURSION 0)");
    }

    @Test
    @DisplayName("재동기화는 ERP에서 가져온 ITEM_SEQ 기준으로 TCO501을 삭제한 뒤 신규 삽입만 한다")
    void resyncTPDROUItemProcMatByRootItem_deletesThenInsertsWithoutUpdate() throws Exception {
        when(erpJdbcTemplate.query(anyString(), any(RowMapper.class), eq(100)))
                .thenReturn(Arrays.asList(erpRow(100, 20), erpRow(20, 0)));

        service.resyncTPDROUItemProcMatByRootItem(100);

        InOrder inOrder = inOrder(mesTPDROUItemProcMatInterfaceDAO);
        inOrder.verify(mesTPDROUItemProcMatInterfaceDAO)
                .deleteMesTPDROUItemProcMatByItemSeqs(Arrays.asList(100, 20));
        inOrder.verify(mesTPDROUItemProcMatInterfaceDAO, times(2)).insertMesTPDROUItemProcMat(anyMap());
        verify(mesTPDROUItemProcMatInterfaceDAO, never()).updateMesTPDROUItemProcMat(anyMap());
        verify(mesTPDROUItemProcMatInterfaceDAO, never()).selectTPDROUItemProcMatTreeItemSeqs(anyInt());
    }

    @Test
    @DisplayName("재동기화 메서드는 delete가 롤백되도록 트랜잭션으로 묶여 있다")
    void resyncTPDROUItemProcMatByRootItem_isTransactional() throws Exception {
        assertThat(ErpToMesInterfaceServiceImpl.class
                .getMethod("resyncTPDROUItemProcMatByRootItem", int.class)
                .isAnnotationPresent(Transactional.class))
                .isTrue();
    }

    private ErpTPDROUItemProcMat erpRow(int itemSeq, int matItemSeq) {
        ErpTPDROUItemProcMat row = new ErpTPDROUItemProcMat();
        row.setCompanySeq(1);
        row.setItemSeq(itemSeq);
        row.setBOMRev("01");
        row.setProcRev("01");
        row.setProcSeq(10);
        row.setWorkCenterSeq(5);
        row.setSerl(1);
        row.setMatItemSeq(matItemSeq);
        row.setUnitSeq(1);
        row.setNeedQtyNumerator(BigDecimal.ONE);
        row.setNeedQtyDenominator(BigDecimal.ONE);
        return row;
    }
}