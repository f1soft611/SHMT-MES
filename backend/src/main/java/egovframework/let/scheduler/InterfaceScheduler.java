package egovframework.let.scheduler;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * 인터페이스 스케쥴러 샘플 (비활성화)
 * 
 * 이 클래스는 기존 샘플 스케쥴러입니다.
 * 새로운 동적 스케쥴러 관리 시스템(DynamicSchedulerService)을 사용하세요.
 * 
 * @author 김기형
 * @since 2025.08.05
 * @deprecated 동적 스케쥴러 관리 시스템으로 대체됨
 */
@Component
@RequiredArgsConstructor
@Deprecated
public class InterfaceScheduler {

    // 샘플 스케쥴러는 비활성화되었습니다.
    // 스케쥴러 관리 페이지에서 스케쥴러를 등록하고 관리하세요.
    
    // @Scheduled(cron = "0 0 * * * *") // 주석처리됨
    // public void runInterfaceJob() {
    //     // 동적 스케쥴러 시스템을 사용하세요
    // }
}