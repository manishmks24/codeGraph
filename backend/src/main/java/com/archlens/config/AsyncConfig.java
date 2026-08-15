package com.archlens.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.task.AsyncTaskExecutor;
import org.springframework.core.task.support.TaskExecutorAdapter;
import org.springframework.scheduling.annotation.EnableAsync;

import java.util.concurrent.Executors;

@Configuration
@EnableAsync
public class AsyncConfig {

    @Bean
    public AsyncTaskExecutor applicationTaskExecutor() {
        // Leverages Java 21 Project Loom Virtual Threads for ultra-scalable unblocked async tasks
        return new TaskExecutorAdapter(Executors.newVirtualThreadPerTaskExecutor());
    }
}
