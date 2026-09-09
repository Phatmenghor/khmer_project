package com.emenu.features.master.service.impl;

import com.emenu.enums.common.Status;
import com.emenu.exception.custom.ResourceNotFoundException;
import com.emenu.features.master.dto.filter.PlatformBankFilterRequest;
import com.emenu.features.master.dto.request.PlatformBankRequest;
import com.emenu.features.master.dto.response.PlatformBankResponse;
import com.emenu.features.master.mapper.PlatformBankMapper;
import com.emenu.features.master.models.PlatformBank;
import com.emenu.features.master.repository.PlatformBankRepository;
import com.emenu.features.master.service.PlatformBankService;
import com.emenu.shared.dto.PaginationResponse;
import com.emenu.shared.mapper.PaginationMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class PlatformBankServiceImpl implements PlatformBankService {

    private final PlatformBankRepository platformBankRepository;
    private final PlatformBankMapper platformBankMapper;
    private final PaginationMapper paginationMapper;

    @Override
    @Transactional(readOnly = true)
    public List<PlatformBankResponse> getPublicActivePlatformBanks() {
        List<PlatformBank> banks = platformBankRepository
                .findByIsDeletedFalseAndStatusOrderByDisplayOrderAscCreatedAtDesc(Status.ACTIVE);
        return platformBankMapper.toResponseList(banks);
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<PlatformBankResponse> getAllPlatformBanksWithFilters(PlatformBankFilterRequest filter) {
        int page = Math.max(0, filter.getPageNo() - 1);
        int size = Math.max(1, filter.getPageSize());
        Sort sort = Sort.by(Sort.Direction.ASC, "displayOrder").and(Sort.by(Sort.Direction.DESC, "createdAt"));
        Pageable pageable = PageRequest.of(page, size, sort);

        Specification<PlatformBank> spec = (root, query, cb) -> {
            var predicates = cb.conjunction();
            predicates = cb.and(predicates, cb.equal(root.get("isDeleted"), false));

            if (filter.getStatus() != null) {
                predicates = cb.and(predicates, cb.equal(root.get("status"), filter.getStatus()));
            }

            if (filter.getSearch() != null && !filter.getSearch().isBlank()) {
                String searchLike = "%" + filter.getSearch().trim().toLowerCase() + "%";
                var namePredicate = cb.like(cb.lower(root.get("name")), searchLike);
                var accNamePredicate = cb.like(cb.lower(root.get("accountName")), searchLike);
                var accNumPredicate = cb.like(cb.lower(root.get("accountNumber")), searchLike);
                predicates = cb.and(predicates, cb.or(namePredicate, accNamePredicate, accNumPredicate));
            }

            return predicates;
        };

        Page<PlatformBank> bankPage = platformBankRepository.findAll(spec, pageable);
        List<PlatformBankResponse> responses = platformBankMapper.toResponseList(bankPage.getContent());
        return paginationMapper.toPaginationResponse(bankPage, responses);
    }

    @Override
    @Transactional(readOnly = true)
    public PlatformBankResponse getPlatformBankById(UUID id) {
        PlatformBank bank = platformBankRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Platform bank not found with id: " + id));
        return platformBankMapper.toResponse(bank);
    }

    @Override
    public PlatformBankResponse createPlatformBank(PlatformBankRequest request) {
        PlatformBank bank = platformBankMapper.toEntity(request);
        if (bank.getStatus() == null) {
            bank.setStatus(Status.ACTIVE);
        }
        if (bank.getDisplayOrder() == null) {
            bank.setDisplayOrder(0);
        }
        PlatformBank saved = platformBankRepository.save(bank);
        log.info("Platform bank created: {} ({})", saved.getName(), saved.getId());
        return platformBankMapper.toResponse(saved);
    }

    @Override
    public PlatformBankResponse updatePlatformBank(UUID id, PlatformBankRequest request) {
        PlatformBank bank = platformBankRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Platform bank not found with id: " + id));

        platformBankMapper.updateEntity(request, bank);
        PlatformBank updated = platformBankRepository.save(bank);
        log.info("Platform bank updated: {} ({})", updated.getName(), updated.getId());
        return platformBankMapper.toResponse(updated);
    }

    @Override
    public void deletePlatformBank(UUID id) {
        PlatformBank bank = platformBankRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Platform bank not found with id: " + id));

        bank.setIsDeleted(true);
        platformBankRepository.save(bank);
        log.info("Platform bank deleted: {} ({})", bank.getName(), id);
    }
}
