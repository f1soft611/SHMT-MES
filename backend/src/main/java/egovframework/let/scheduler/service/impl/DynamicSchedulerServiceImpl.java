package egovframework.let.scheduler.service.impl;

import egovframework.let.scheduler.domain.repository.SchedulerConfigDAO;
import egovframework.let.scheduler.domain.repository.SchedulerHistoryDAO;
import egovframework.let.scheduler.domain.model.SchedulerConfig;
import egovframework.let.scheduler.domain.model.SchedulerHistory;
import egovframework.let.scheduler.service.DynamicSchedulerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationContext;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.scheduling.annotation.SchedulingConfigurer;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.scheduling.config.ScheduledTaskRegistrar;
import org.springframework.scheduling.support.CronTrigger;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.lang.reflect.Method;
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
    private final ApplicationContext applicationContext;
    
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
        String jobClassName = config.getJobClassName();
        log.info("스케쥴러 작업 실행: {} - {}", config.getSchedulerName(), jobClassName);
        
        try {
            // jobClassName 형식: egovframework.let.scheduler.service.ErpToMesInterfaceService 또는
            //                   egovframework.let.scheduler.service.ErpToMesInterfaceService.executeInterface
            
            String serviceName;
            String methodName = null;
            
            // 메서드명이 포함된 경우 분리
            if (jobClassName.contains(".") && 
                Character.isLowerCase(jobClassName.charAt(jobClassName.lastIndexOf('.') + 1))) {
                int lastDotIndex = jobClassName.lastIndexOf('.');
                serviceName = jobClassName.substring(0, lastDotIndex);
                methodName = jobClassName.substring(lastDotIndex + 1);
            } else {
                serviceName = jobClassName;
            }
            
            // 클래스 이름에서 서비스 빈 이름 추출
            String beanName = getBeanNameFromClassName(serviceName);
            
            // Spring 컨텍스트에서 서비스 빈 조회
            Object serviceBean = applicationContext.getBean(beanName);
            
            if (serviceBean == null) {
                throw new IllegalArgumentException("서비스 빈을 찾을 수 없습니다: " + beanName);
            }
            
            // 메서드 실행
            if (methodName != null && !methodName.isEmpty()) {
                // 특정 메서드 호출
                Method method = serviceBean.getClass().getMethod(methodName);
                method.invoke(serviceBean);
                log.info("메서드 실행 완료: {}.{}", beanName, methodName);
            } else {
                // executeInterface 메서드를 기본으로 호출
                try {
                    Method executeMethod = serviceBean.getClass().getMethod("executeInterface");
                    executeMethod.invoke(serviceBean);
                    log.info("executeInterface 메서드 실행 완료: {}", beanName);
                } catch (NoSuchMethodException e) {
                    // execute 메서드 시도
                    try {
                        Method executeMethod = serviceBean.getClass().getMethod("execute");
                        executeMethod.invoke(serviceBean);
                        log.info("execute 메서드 실행 완료: {}", beanName);
                    } catch (NoSuchMethodException e2) {
                        throw new IllegalArgumentException(
                            "서비스에 executeInterface() 또는 execute() 메서드가 없습니다: " + beanName);
                    }
                }
            }
            
        } catch (Exception e) {
            log.error("스케쥴러 작업 실행 실패: {}", config.getSchedulerName(), e);
            throw e;
        }
    }
    
    /**
     * 클래스 전체 경로에서 Spring Bean 이름을 추출
     * 예: egovframework.let.scheduler.service.ErpToMesInterfaceService -> erpToMesInterfaceService
     */
    private String getBeanNameFromClassName(String className) {
        // 클래스 전체 경로에서 마지막 클래스명만 추출
        String simpleClassName = className.substring(className.lastIndexOf('.') + 1);
        
        // 첫 글자를 소문자로 변환하여 Bean 이름 생성
        return Character.toLowerCase(simpleClassName.charAt(0)) + simpleClassName.substring(1);
    }

    @Override
    public void executeSchedulerManually(Long schedulerId) throws Exception {
        log.info("스케쥴러 수동 실행 시작: schedulerId={}", schedulerId);
        
        // 스케쥴러 설정 조회
        SchedulerConfig config = schedulerConfigDAO.selectSchedulerDetail(schedulerId);
        if (config == null) {
            throw new IllegalArgumentException("스케쥴러를 찾을 수 없습니다: " + schedulerId);
        }
        
        // TaskScheduler를 사용하여 비동기로 실행
        if (taskScheduler != null) {
            Runnable task = createTaskRunnable(config);
            taskScheduler.schedule(task, new Date());
        } else {
            log.warn("TaskScheduler가 초기화되지 않아 동기로 실행합니다.");
            Runnable task = createTaskRunnable(config);
            task.run();
        }
        
        log.info("스케쥴러 수동 실행 요청 완료: {}", config.getSchedulerName());
    }
}
