package com.emenu.features.master.repository;

import com.emenu.enums.common.Status;
import com.emenu.features.master.models.PlatformBank;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PlatformBankRepository extends JpaRepository<PlatformBank, UUID>, JpaSpecificationExecutor<PlatformBank> {

    List<PlatformBank> findByIsDeletedFalseAndStatusOrderByDisplayOrderAscCreatedAtDesc(Status status);

    Optional<PlatformBank> findByIdAndIsDeletedFalse(UUID id);

    Page<PlatformBank> findByIsDeletedFalse(Pageable pageable);
}
