package egovframework.let.production.result.service.impl;

import egovframework.let.erpIf.domain.repository.ErpIFProdResultDAO;
import egovframework.let.production.result.domain.model.ErpIFProdResultDto;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.ArgumentMatchers.any;

@ExtendWith(MockitoExtension.class)
class ErpIFProdResultServiceImplTest {

    @Mock
    private ErpIFProdResultDAO erpIfDao;

    @Test
    void sendProdResultToErp_insertsAndReturnsTrue() {
        ErpIFProdResultServiceImpl service = new ErpIFProdResultServiceImpl(erpIfDao);
        ErpIFProdResultDto dto = new ErpIFProdResultDto();
        dto.setMesIfKey("PR20260727001");

        boolean result = service.sendProdResultToErp(dto);

        assertThat(result).isTrue();
        verify(erpIfDao).insertErpIFProdResult(dto);
    }

    @Test
    void sendProdResultToErp_daoExceptionReturnsFalseWithoutThrowing() {
        ErpIFProdResultServiceImpl service = new ErpIFProdResultServiceImpl(erpIfDao);
        ErpIFProdResultDto dto = new ErpIFProdResultDto();
        dto.setMesIfKey("PR20260727002");

        doThrow(new RuntimeException("erp db down")).when(erpIfDao).insertErpIFProdResult(any());

        boolean result = service.sendProdResultToErp(dto);

        assertThat(result).isFalse();
    }
}