package com.example.englishapp_server.curriculum.importer;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.io.DefaultResourceLoader;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class CurriculumBootstrapRunner implements ApplicationRunner {
    private static final Logger log = LoggerFactory.getLogger(CurriculumBootstrapRunner.class);

    private final CurriculumBootstrapService bootstrapService;
    private final boolean enabled;
    private final List<Resource> packages;

    public CurriculumBootstrapRunner(
            CurriculumBootstrapService bootstrapService,
            @Value("${app.curriculum.bootstrap.enabled:true}") boolean enabled,
            @Value("${app.curriculum.bootstrap.locations:classpath:curriculum/starters-v4/manifest.json,classpath:curriculum/movers-v1/manifest.json,classpath:curriculum/flyers-v1/manifest.json}") String locations) {
        this.bootstrapService = bootstrapService;
        this.enabled = enabled;
        var loader = new DefaultResourceLoader();
        this.packages = Arrays.stream(locations.split(","))
                .map(String::trim)
                .filter(location -> !location.isEmpty())
                .map(loader::getResource)
                .toList();
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!enabled) {
            log.info("Curriculum bootstrap is disabled");
            return;
        }

        var result = bootstrapService.importIfDatabaseIsEmpty(packages);
        if (result.imported()) {
            log.info("Bootstrapped curriculum versions {}", result.versionCodes());
        } else {
            log.info("Skipped curriculum bootstrap because {} version(s) already exist", result.existingVersionCount());
        }
    }
}
