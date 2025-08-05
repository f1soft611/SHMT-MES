package egovframework.let.scheduler;

import egovframework.let.scheduler.service.ErpToMesInterfaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class InterfaceScheduler {

    private final ErpToMesInterfaceService erpToMesInterfaceService;

    @Scheduled(cron = "0 * * * * *") // 매시간 0분마다 실행
    public void runInterfaceJob() {
        // 서비스 호출 (예: 이력 등록, 조회 등)
        try {
            erpToMesInterfaceService.runJob();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}