package egovframework.let.basedata.processFlow.service.impl;

import egovframework.com.cmm.exception.BizException;
import egovframework.let.basedata.processFlow.domain.model.ProcessFlow;
import egovframework.let.basedata.processFlow.domain.model.ProcessFlowProcess;
import egovframework.let.basedata.processFlow.domain.repository.ProcessFlowDAO;
import egovframework.let.basedata.processFlow.dto.ProcessFlowProcessSaveRequest;
import org.egovframe.rte.fdl.idgnr.EgovIdGnrService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
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
