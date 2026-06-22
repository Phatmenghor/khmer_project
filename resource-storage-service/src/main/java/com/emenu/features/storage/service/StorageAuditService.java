package com.emenu.features.storage.service;

import com.emenu.features.storage.model.StorageResource;

/** Persists upload audit rows off the request thread so uploads respond as soon as S3 confirms the write. */
public interface StorageAuditService {

    void saveAsync(StorageResource resource);
}
