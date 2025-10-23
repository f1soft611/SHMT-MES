package egovframework.let.scheduler.service.impl;

import egovframework.let.scheduler.mapper.SchedulerConfigDAO;
import egovframework.let.scheduler.mapper.SchedulerHistoryDAO;
import egovframework.let.scheduler.model.SchedulerConfig;
import egovframework.let.scheduler.model.SchedulerHistory;
import egovframework.let.scheduler.service.DynamicSchedulerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.scheduling.annotation.SchedulingConfigurer;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.scheduling.config.ScheduledTaskRegistrar;
import org.springframework.scheduling.support.CronTrigger;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ScheduledFuture;

/**
 * 동적 스케쥴러 관리 서비스 구현체
 * @author AI Assistant
 * @since 2025.10.23
 * @version 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DynamicSchedulerServiceImpl implements DynamicSchedulerService, SchedulingConfigurer {

    private final SchedulerConfigDAO schedulerConfigDAO;
    private final SchedulerHistoryDAO schedulerHistoryDAO;
    
    private TaskScheduler taskScheduler;
    private final Map<Long, ScheduledFuture<?>> scheduledTasks = new ConcurrentHashMap<>();

    @Override
    public void configureTasks(ScheduledTaskRegistrar taskRegistrar) {
        ThreadPoolTaskScheduler scheduler = new ThreadPoolTaskScheduler();
        scheduler.setPoolSize(10);
        scheduler.setThreadNamePrefix("dynamic-scheduler-");
        scheduler.initialize();
        this.taskScheduler = scheduler;
        taskRegistrar.setTaskScheduler(scheduler);
    }

    @PostConstruct
    public void init() {
        try {
            log.info("스케쥴러 초기화 시작");
            initializeSchedulers();
            log.info("스케쥴러 초기화 완료");
        } catch (Exception e) {
            log.error("스케쥴러 초기화 실패", e);
        }
    }

    @Override
    public void initializeSchedulers() throws Exception {
        List<SchedulerConfig> schedulers = schedulerConfigDAO.selectEnabledSchedulers();
        for (SchedulerConfig scheduler : schedulers) {
            scheduleTask(scheduler);
        }
    }

    @Override
    public void restartSchedulers() throws Exception {
        log.info("스케쥴러 재시작 시작");
        
        // 모든 기존 스케쥴 작업 취소
        scheduledTasks.values().forEach(task -> task.cancel(false));
        scheduledTasks.clear();
        
        // 활성화된 스케쥴러 다시 등록
        initializeSchedulers();
        
        log.info("스케쥴러 재시작 완료");
    }

    private void scheduleTask(SchedulerConfig config) {
        if (taskScheduler == null) {
            log.warn("TaskScheduler가 초기화되지 않았습니다.");
            return;
        }

        try {
            Runnable task = createTaskRunnable(config);
            CronTrigger cronTrigger = new CronTrigger(config.getCronExpression());
            ScheduledFuture<?> scheduledTask = taskScheduler.schedule(task, cronTrigger);
            scheduledTasks.put(config.getSchedulerId(), scheduledTask);
            
            log.info("스케쥴러 등록 완료: {} (CRON: {})", config.getSchedulerName(), config.getCronExpression());
        } catch (Exception e) {
            log.error("스케쥴러 등록 실패: {}", config.getSchedulerName(), e);
        }
    }

    private Runnable createTaskRunnable(SchedulerConfig config) {
        return () -> {
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            String startTimeStr = sdf.format(new Date());
            long startTime = System.currentTimeMillis();

            SchedulerHistory history = new SchedulerHistory();
            history.setSchedulerId(config.getSchedulerId());
            history.setSchedulerName(config.getSchedulerName());
            history.setStartTime(startTimeStr);
            history.setStatus("RUNNING");

            try {
                // 이력 등록
                schedulerHistoryDAO.insertSchedulerHistory(history);
                
                // 실제 작업 실행
                executeJob(config);
                
                // 성공 처리
                long endTime = System.currentTimeMillis();
                history.setEndTime(sdf.format(new Date()));
                history.setStatus("SUCCESS");
                history.setExecutionTimeMs(endTime - startTime);
                
                log.info("스케쥴러 실행 성공: {} (실행시간: {}ms)", config.getSchedulerName(), (endTime - startTime));
            } catch (Exception e) {
                // 실패 처리
                long endTime = System.currentTimeMillis();
                history.setEndTime(sdf.format(new Date()));
                history.setStatus("FAILED");
                history.setErrorMessage(e.getMessage());
                history.setExecutionTimeMs(endTime - startTime);
                
                log.error("스케쥴러 실행 실패: {}", config.getSchedulerName(), e);
            } finally {
                try {
                    schedulerHistoryDAO.updateSchedulerHistory(history);
                } catch (Exception e) {
                    log.error("스케쥴러 이력 업데이트 실패", e);
                }
            }
        };
    }

    private void executeJob(SchedulerConfig config) throws Exception {
        // TODO: 실제 작업 클래스를 동적으로 로드하여 실행
        // 현재는 샘플 로직으로 대체
        log.info("스케쥴러 작업 실행: {} - {}", config.getSchedulerName(), config.getJobClassName());
        
        // 샘플: 1초 대기
        Thread.sleep(1000);
    }
}
