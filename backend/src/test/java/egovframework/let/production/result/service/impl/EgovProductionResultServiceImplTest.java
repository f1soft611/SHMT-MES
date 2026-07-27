package egovframework.let.production.result.service.impl;

import egovframework.let.production.result.domain.model.*;
import egovframework.let.production.result.domain.repository.ProductionResultDAO;
import egovframework.let.production.result.service.ErpIFProdResultService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.inOrder;

import org.mockito.InOrder;


@ExtendWith(MockitoExtension.class)
class EgovProductionResultServiceImplTest {

    @Mock
    private ProductionResultDAO productionResultDAO;

    @Mock
    private ErpIFProdResultService erpIfService;

    private ProdResultErpLinkRow linkRow() {
        ProdResultErpLinkRow row = new ProdResultErpLinkRow();
        row.setTpr601Id("PR20260727001");
        row.setItemCode("ITM1");
        row.setProdplanDate("20260727");
        row.setProdQty(10);
        row.setGoodQty(9);
        row.setBadQty(1);
        row.setProdStime("2026-07-27 08:00");
        row.setProdEtime("2026-07-27 09:00");
        row.setLotNo("LOT1");
        row.setWorkorderSeq(5);
        return row;
    }

    @Test
    void insertProductionResult_sendsAddToErp() throws Exception {
        EgovProductionResultServiceImpl service =
                new EgovProductionResultServiceImpl(productionResultDAO, erpIfService);

        ProdResultInsertDto dto = new ProdResultInsertDto();
        dto.setTpr601Id("new-1");
        dto.setProdplanDate("20260727");
        dto.setProdplanSeq(1);
        dto.setProdworkSeq(1);
        dto.setWorkSeq(1);
        dto.setProdQty(10);
        dto.setGoodQty(9);
        dto.setBadQty(1);
        dto.setProdStime("2026-07-27 08:00");
        dto.setProdEtime("2026-07-27 09:00");

        when(productionResultDAO.selectProdResultNextId()).thenReturn("PR20260727001");
        when(productionResultDAO.selectProdSeq(dto)).thenReturn(1);
        when(productionResultDAO.selectProductionResultForErp(dto)).thenReturn(linkRow());

        service.insertProductionResult(Collections.singletonList(dto));

        verify(erpIfService).sendProdResultToErp(argThat(ifDto ->
                "A".equals(ifDto.getWorkingTag())
                        && "PR20260727001".equals(ifDto.getMesIfKey())
                        && "LOT1".equals(ifDto.getLotNo())
                        && Integer.valueOf(5).equals(ifDto.getWorkOrderSeq())
                        && Integer.valueOf(10).equals(ifDto.getProdQty())
                        && "0800".equals(ifDto.getWorkStartTime())
                        && "0900".equals(ifDto.getWorkEndTime())
        ));
    }

    @Test
    void insertProductionResult_erpFailureDoesNotBlockMesSave() throws Exception {
        EgovProductionResultServiceImpl service =
                new EgovProductionResultServiceImpl(productionResultDAO, erpIfService);

        ProdResultInsertDto dto = new ProdResultInsertDto();
        dto.setTpr601Id("new-1");
        dto.setProdplanDate("20260727");
        dto.setProdplanSeq(1);
        dto.setProdworkSeq(1);
        dto.setWorkSeq(1);

        when(productionResultDAO.selectProdResultNextId()).thenReturn("PR20260727001");
        when(productionResultDAO.selectProdSeq(dto)).thenReturn(1);
        when(productionResultDAO.selectProductionResultForErp(dto))
                .thenThrow(new RuntimeException("erp db down"));

        assertThatCode(() -> service.insertProductionResult(Collections.singletonList(dto)))
                .doesNotThrowAnyException();

        verify(productionResultDAO).insertProductionResult(dto);
    }

    @Test
    void updateProductionResult_sendsDeleteThenAddToErp() throws Exception {
        EgovProductionResultServiceImpl service =
                new EgovProductionResultServiceImpl(productionResultDAO, erpIfService);

        ProdResultUpdateDto dto = new ProdResultUpdateDto();
        dto.setTpr601Id("PR20260727001");
        dto.setProdplanDate("20260727");
        dto.setProdplanSeq(1);
        dto.setProdworkSeq(1);
        dto.setWorkSeq(1);
        dto.setProdSeq(1);
        dto.setProdQty(20);
        dto.setGoodQty(18);
        dto.setBadQty(2);
        dto.setProdStime("2026-07-27 10:00");
        dto.setProdEtime("2026-07-27 11:00");

        when(productionResultDAO.selectProductionResultForErp(dto)).thenReturn(linkRow());

        service.updateProductionResult(Collections.singletonList(dto));

        InOrder inOrder = inOrder(erpIfService);
        inOrder.verify(erpIfService).sendProdResultToErp(argThat(d -> "D".equals(d.getWorkingTag())));
        inOrder.verify(erpIfService).sendProdResultToErp(argThat(d ->
                "A".equals(d.getWorkingTag())
                        && Integer.valueOf(20).equals(d.getProdQty())
                        && "1100".equals(d.getWorkEndTime()) // 새 prodEtime(11:00)을 써야 함 - linkRow의 09:00이 아님
        ));
    }

    @Test
    void updateProductionResult_deleteFailureStillSendsAdd() throws Exception {
        EgovProductionResultServiceImpl service =
                new EgovProductionResultServiceImpl(productionResultDAO, erpIfService);

        ProdResultUpdateDto dto = new ProdResultUpdateDto();
        dto.setTpr601Id("PR20260727001");
        dto.setProdplanDate("20260727");
        dto.setProdplanSeq(1);
        dto.setProdworkSeq(1);
        dto.setWorkSeq(1);
        dto.setProdSeq(1);
        dto.setProdQty(20);

        when(productionResultDAO.selectProductionResultForErp(dto)).thenReturn(linkRow());
        doThrow(new RuntimeException("erp down"))
                .when(erpIfService).sendProdResultToErp(argThat(d -> "D".equals(d.getWorkingTag())));

        service.updateProductionResult(Collections.singletonList(dto));

        verify(erpIfService).sendProdResultToErp(argThat(d -> "A".equals(d.getWorkingTag())));
    }
}