package egovframework.let.scheduler.service;

import egovframework.let.scheduler.mapper.InterfaceHistoryDAO;
import egovframework.let.scheduler.model.InterfaceHistory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.text.SimpleDateFormat;

@Service
public class ErpToMesInterfaceService {

    @Autowired
    private InterfaceHistoryDAO historyMapper;

    public void runJob() throws Exception {
        InterfaceHistory history = new InterfaceHistory();
        history.setInterfaceName("ERP_TO_MES");

        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMddHHmmss");
        String nowString = sdf.format(new java.util.Date(System.currentTimeMillis()));
        history.setStartTime(nowString);

        try {
            // 실제 비즈니스 로직 (예: ERP 데이터 조회)
            history.setResultStatus("SUCCESS");
        } catch (Exception e) {
            history.setResultStatus("FAIL");
            history.setErrorMessage(e.getMessage());
        } finally {
            String endString = sdf.format(new java.util.Date(System.currentTimeMillis()));
            history.setEndTime(endString);
            historyMapper.insertInterfaceHistory(history);
        }
    }
}
