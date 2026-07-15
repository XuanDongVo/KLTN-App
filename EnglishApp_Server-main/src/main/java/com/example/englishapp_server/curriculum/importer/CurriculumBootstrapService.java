package com.example.englishapp_server.curriculum.importer;

import com.example.englishapp_server.curriculum.repository.CurriculumVersionRepository;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class CurriculumBootstrapService {
    private final CurriculumVersionRepository versionRepository;
    private final CurriculumImportService importService;

    public CurriculumBootstrapService(CurriculumVersionRepository versionRepository,
                                      CurriculumImportService importService) {
        this.versionRepository = versionRepository;
        this.importService = importService;
    }

    @Transactional
    public BootstrapResult importIfDatabaseIsEmpty(List<Resource> packages) {
        long existingVersions = versionRepository.count();
        if (existingVersions > 0) {
            return new BootstrapResult(false, existingVersions, List.of());
        }
        if (packages.isEmpty()) {
            throw new IllegalArgumentException("At least one curriculum package is required for bootstrap");
        }

        List<String> importedVersions = new ArrayList<>();
        for (Resource packageResource : packages) {
            try (var input = packageResource.getInputStream()) {
                var result = importService.importPackage(input);
                importedVersions.add(result.versionCode());
            } catch (Exception exception) {
                throw new IllegalStateException("Cannot bootstrap curriculum from " + packageResource, exception);
            }
        }
        return new BootstrapResult(true, 0, List.copyOf(importedVersions));
    }

    public record BootstrapResult(boolean imported, long existingVersionCount, List<String> versionCodes) {}
}
