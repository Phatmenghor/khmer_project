package com.emenu.features.storage.service.impl;

import com.emenu.features.storage.model.StorageResource;
import com.emenu.features.storage.repository.StorageResourceRepository;
import com.emenu.features.storage.service.StorageAuditService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class StorageAuditServiceImpl implements StorageAuditService {

    private final StorageResourceRepository storageResourceRepository;

    @Override
    @Async
    @Transactional
    public void saveAsync(StorageResource resource) {
        try {
            storageResourceRepository.save(resource);
            log.info("Persisted audit log: key=[{}]", resource.getObjectKey());
        } catch (Exception e) {
            log.error("Failed to persist audit log for key=[{}]: {}", resource.getObjectKey(), e.getMessage());
        }
    }
}
