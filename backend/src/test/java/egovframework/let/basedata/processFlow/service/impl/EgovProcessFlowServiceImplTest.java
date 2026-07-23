package egovframework.let.basedata.processFlow.service.impl;

import egovframework.com.cmm.exception.BizException;
import egovframework.let.basedata.processFlow.domain.model.ProcessFlow;
import egovframework.let.basedata.processFlow.domain.model.ProcessFlowItem;
import egovframework.let.basedata.processFlow.domain.model.ProcessFlowProcess;
import egovframework.let.basedata.processFlow.domain.repository.ProcessFlowDAO;
import egovframework.let.basedata.processFlow.dto.ProcessFlowItemDeltaResponse;
import egovframework.let.basedata.processFlow.dto.ProcessFlowProcessSaveRequest;
import org.egovframe.rte.fdl.cmmn.exception.FdlException;
import org.egovframe.rte.fdl.idgnr.EgovIdGnrService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EgovProcessFlowServiceImplTest {

    @Mock
    private ProcessFlowDAO processFlowDAO;

    @Mock
    private EgovIdGnrService processIdGenerator;

    @InjectMocks
    private EgovProcessFlowServiceImpl service;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(
                service, "egovProcessFlowProcessIdGnrService", processIdGenerator);
        ReflectionTestUtils.setField(
                service, "egovProcessFlowItemIdGnrService", processIdGenerator);
    }

    @Test
    void savesDuplicateProcessCodesAsSeparateRowsAndReturnsCanonicalRows() throws Exception {
        ProcessFlow flow = flow("PF-1", "FLOW-1", "000001");
        List<ProcessFlowProcess> canonical = Arrays.asList(process("FP-1"), process("FP-2"));
        when(processFlowDAO.selectProcessFlowByIdAndFactory("PF-1", "000001"))
                .thenReturn(flow);
        when(processIdGenerator.getNextStringId()).thenReturn("FP-1", "FP-2");
        when(processFlowDAO.selectProcessByFlowId("PF-1", "000001")).thenReturn(canonical);

        List<ProcessFlowProcessSaveRequest.Entry> entries = Arrays.asList(
                entry("PROC-A", 1, "Y", "N"),
                entry("PROC-A", 2, "N", "Y"));

        List<ProcessFlowProcess> result =
                service.saveProcessFlowProcesses("PF-1", "000001", "user-1", entries);

        ArgumentCaptor<ProcessFlowProcess> captor =
                ArgumentCaptor.forClass(ProcessFlowProcess.class);
        verify(processFlowDAO, times(2)).insertProcessFlowProcess(captor.capture());
        assertThat(captor.getAllValues())
                .extracting(ProcessFlowProcess::getFlowProcessCode)
                .containsExactly("PROC-A", "PROC-A");
        assertThat(captor.getAllValues())
                .extracting(ProcessFlowProcess::getProcessSeq)
                .containsExactly("1", "2");
        verify(processFlowDAO).deleteProcessFlowProcess("PF-1", "000001");
        assertThat(result).containsExactlyElementsOf(canonical);
    }

    @Test
    void rejectsDuplicateSequenceBeforeDelete() {
        List<ProcessFlowProcessSaveRequest.Entry> entries = Arrays.asList(
                entry("PROC-A", 1, "Y", "N"),
                entry("PROC-B", 1, "N", "N"));

        assertThatThrownBy(() ->
                service.saveProcessFlowProcesses("PF-1", "000001", "user-1", entries))
                .isInstanceOf(BizException.class);
        verify(processFlowDAO, never()).deleteProcessFlowProcess(anyString(), anyString());
    }

    @Test
    void rejectsMoreThanFiveRows() {
        List<ProcessFlowProcessSaveRequest.Entry> six = IntStream.rangeClosed(1, 6)
                .mapToObj(i -> entry("P-" + i, i, i == 1 ? "Y" : "N", "N"))
                .collect(Collectors.toList());

        assertThatThrownBy(() ->
                service.saveProcessFlowProcesses("PF-1", "000001", "user-1", six))
                .isInstanceOf(BizException.class);
    }

    @Test
    void rejectsInvalidPlanProcessCount() {
        List<ProcessFlowProcessSaveRequest.Entry> entries = Arrays.asList(
                entry("PROC-A", 1, "N", "N"),
                entry("PROC-B", 2, "N", "Y"));

        assertThatThrownBy(() ->
                service.saveProcessFlowProcesses("PF-1", "000001", "user-1", entries))
                .isInstanceOf(BizException.class);
    }

    @Test
    void savesItemDeltaAndReturnsGeneratedRows() throws Exception {
        when(processFlowDAO.selectProcessFlowByIdAndFactory("PF-1", "000001"))
                .thenReturn(flow("PF-1", "FLOW-1", "000001"));
        when(processFlowDAO.selectOwnedFlowItemIds(
                "PF-1", "000001", Collections.singletonList("FI-1")))
                .thenReturn(Collections.singletonList("FI-1"));
        when(processFlowDAO.selectRegisteredItemIds(Collections.singletonList("ITEM-2")))
                .thenReturn(Collections.emptyList());
        when(processFlowDAO.selectItemMasters(
                "000001", Collections.singletonList("ITEM-2")))
                .thenReturn(Collections.singletonList(item("ITEM-2", "CODE-2")));
        when(processFlowDAO.deleteProcessFlowItems(
                "PF-1", "000001", Collections.singletonList("FI-1")))
                .thenReturn(1);
        when(processIdGenerator.getNextStringId()).thenReturn("FI-2");

        ProcessFlowItemDeltaResponse result = service.saveProcessFlowItemDelta(
                "PF-1", "000001", "user-1",
                Collections.singletonList("ITEM-2"),
                Collections.singletonList("FI-1"));

        verify(processFlowDAO).deleteProcessFlowItems(
                "PF-1", "000001", Collections.singletonList("FI-1"));
        assertThat(result.getDeletedFlowItemIds()).containsExactly("FI-1");
        assertThat(result.getAddedItems())
                .extracting(ProcessFlowItem::getFlowItemId)
                .containsExactly("FI-2");
    }

    @Test
    void rejectsDeleteIdOwnedByAnotherFlowBeforeMutation() {
        when(processFlowDAO.selectProcessFlowByIdAndFactory("PF-1", "000001"))
                .thenReturn(flow("PF-1", "FLOW-1", "000001"));
        when(processFlowDAO.selectOwnedFlowItemIds(
                "PF-1", "000001", Collections.singletonList("FI-X")))
                .thenReturn(Collections.emptyList());

        assertThatThrownBy(() -> service.saveProcessFlowItemDelta(
                "PF-1", "000001", "user-1",
                Collections.emptyList(), Collections.singletonList("FI-X")))
                .isInstanceOf(BizException.class);
        verify(processFlowDAO, never()).deleteProcessFlowItems(
                anyString(), anyString(), anyList());
    }

    @Test
    void rejectsAlreadyRegisteredItem() {
        when(processFlowDAO.selectProcessFlowByIdAndFactory("PF-1", "000001"))
                .thenReturn(flow("PF-1", "FLOW-1", "000001"));
        when(processFlowDAO.selectRegisteredItemIds(Collections.singletonList("ITEM-2")))
                .thenReturn(Collections.singletonList("ITEM-2"));

        assertThatThrownBy(() -> service.saveProcessFlowItemDelta(
                "PF-1", "000001", "user-1",
                Collections.singletonList("ITEM-2"), Collections.emptyList()))
                .isInstanceOf(BizException.class);
    }

    @Test
    void rejectsMissingOrInactiveItemBeforeDelete() {
        when(processFlowDAO.selectProcessFlowByIdAndFactory("PF-1", "000001"))
                .thenReturn(flow("PF-1", "FLOW-1", "000001"));
        when(processFlowDAO.selectRegisteredItemIds(Collections.singletonList("ITEM-2")))
                .thenReturn(Collections.emptyList());
        when(processFlowDAO.selectItemMasters(
                "000001", Collections.singletonList("ITEM-2")))
                .thenReturn(Collections.emptyList());

        assertThatThrownBy(() -> service.saveProcessFlowItemDelta(
                "PF-1", "000001", "user-1",
                Collections.singletonList("ITEM-2"), Collections.emptyList()))
                .isInstanceOf(BizException.class);
        verify(processFlowDAO, never()).deleteProcessFlowItems(
                anyString(), anyString(), anyList());
    }

    @Test
    void failsWhenScopedDeleteCountChangesBeforeAnyInsert() {
        when(processFlowDAO.selectProcessFlowByIdAndFactory("PF-1", "000001"))
                .thenReturn(flow("PF-1", "FLOW-1", "000001"));
        when(processFlowDAO.selectOwnedFlowItemIds(
                "PF-1", "000001", Collections.singletonList("FI-1")))
                .thenReturn(Collections.singletonList("FI-1"));
        when(processFlowDAO.selectRegisteredItemIds(Collections.singletonList("ITEM-2")))
                .thenReturn(Collections.emptyList());
        when(processFlowDAO.selectItemMasters(
                "000001", Collections.singletonList("ITEM-2")))
                .thenReturn(Collections.singletonList(item("ITEM-2", "CODE-2")));
        when(processFlowDAO.deleteProcessFlowItems(
                "PF-1", "000001", Collections.singletonList("FI-1")))
                .thenReturn(0);

        assertThatThrownBy(() -> service.saveProcessFlowItemDelta(
                "PF-1", "000001", "user-1",
                Collections.singletonList("ITEM-2"), Collections.singletonList("FI-1")))
                .isInstanceOf(BizException.class);
        verify(processFlowDAO, never()).insertProcessFlowItem(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void rejectsItemAlreadyRegisteredAtAnotherFactory() {
        when(processFlowDAO.selectProcessFlowByIdAndFactory("PF-1", "000001"))
                .thenReturn(flow("PF-1", "FLOW-1", "000001"));
        when(processFlowDAO.selectRegisteredItemIds(Collections.singletonList("ITEM-2")))
                .thenReturn(Collections.singletonList("ITEM-2"));

        assertThatThrownBy(() -> service.saveProcessFlowItemDelta(
                "PF-1", "000001", "user-1",
                Collections.singletonList("ITEM-2"), Collections.emptyList()))
                .isInstanceOf(BizException.class);
        verify(processFlowDAO, never()).selectItemMasters(
                anyString(), anyList());
    }

    @Test
    void declaresRollbackForCheckedExceptionsOnReplaceOperations() throws Exception {
        assertThat(EgovProcessFlowServiceImpl.class
                .getMethod("saveProcessFlowProcesses", String.class, String.class, String.class, List.class)
                .getAnnotation(Transactional.class).rollbackFor())
                .contains(Exception.class);
        assertThat(EgovProcessFlowServiceImpl.class
                .getMethod("saveProcessFlowItemDelta", String.class, String.class, String.class, List.class, List.class)
                .getAnnotation(Transactional.class).rollbackFor())
                .contains(Exception.class);
    }

    @Test
    void propagatesCheckedIdGenerationFailureAfterDeltaDelete() throws Exception {
        when(processFlowDAO.selectProcessFlowByIdAndFactory("PF-1", "000001"))
                .thenReturn(flow("PF-1", "FLOW-1", "000001"));
        when(processFlowDAO.selectOwnedFlowItemIds(
                "PF-1", "000001", Collections.singletonList("FI-1")))
                .thenReturn(Collections.singletonList("FI-1"));
        when(processFlowDAO.selectRegisteredItemIds(Collections.singletonList("ITEM-2")))
                .thenReturn(Collections.emptyList());
        when(processFlowDAO.selectItemMasters(
                "000001", Collections.singletonList("ITEM-2")))
                .thenReturn(Collections.singletonList(item("ITEM-2", "CODE-2")));
        when(processFlowDAO.deleteProcessFlowItems(
                "PF-1", "000001", Collections.singletonList("FI-1")))
                .thenReturn(1);
        when(processIdGenerator.getNextStringId()).thenThrow(new FdlException("ID generation failed"));

        assertThatThrownBy(() -> service.saveProcessFlowItemDelta(
                "PF-1", "000001", "user-1",
                Collections.singletonList("ITEM-2"), Collections.singletonList("FI-1")))
                .isInstanceOf(FdlException.class);
        verify(processFlowDAO).deleteProcessFlowItems(
                "PF-1", "000001", Collections.singletonList("FI-1"));
        verify(processFlowDAO, never()).insertProcessFlowItem(org.mockito.ArgumentMatchers.any());
    }

    private ProcessFlow flow(String id, String code, String factoryCode) {
        ProcessFlow flow = new ProcessFlow();
        flow.setProcessFlowId(id);
        flow.setProcessFlowCode(code);
        flow.setFactoryCode(factoryCode);
        return flow;
    }

    private ProcessFlowProcess process(String id) {
        ProcessFlowProcess process = new ProcessFlowProcess();
        process.setFlowProcessId(id);
        return process;
    }

    private ProcessFlowItem item(String id, String code) {
        ProcessFlowItem item = new ProcessFlowItem();
        item.setFlowItemCodeId(id);
        item.setFlowItemCode(code);
        return item;
    }

    private ProcessFlowProcessSaveRequest.Entry entry(
            String code, Integer seq, String planFlag, String lastFlag) {
        ProcessFlowProcessSaveRequest.Entry entry = new ProcessFlowProcessSaveRequest.Entry();
        entry.setFlowProcessCode(code);
        entry.setSeq(seq);
        entry.setPlanFlag(planFlag);
        entry.setLastFlag(lastFlag);
        return entry;
    }
}
