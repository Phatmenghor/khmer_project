package com.emenu.features.bakong.service.impl;

import com.emenu.features.bakong.dto.BakongAccountCreateRequest;
import com.emenu.features.bakong.dto.BakongAccountResponse;
import com.emenu.features.bakong.dto.BakongAccountSearchRequest;
import com.emenu.features.bakong.dto.BakongAccountUpdateRequest;
import com.emenu.features.bakong.dto.BakongIdRequest;
import com.emenu.features.bakong.mapper.BakongAccountMapper;
import com.emenu.features.bakong.model.BakongAccount;
import com.emenu.features.bakong.repository.BakongAccountRepository;
import com.emenu.features.bakong.service.BakongAccountService;
import com.emenu.shared.dto.PageResponse;
import com.emenu.shared.pagination.PaginationUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BakongAccountServiceImpl implements BakongAccountService {

    private final BakongAccountRepository repository;
    private final BakongAccountMapper mapper;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<BakongAccountResponse> getAllAccounts(BakongAccountSearchRequest request) {
        log.info("Fetching Bakong accounts with request: {}", request);
        String search = (request != null) ? PaginationUtils.extractSearch(request.getSearch()) : null;
        Pageable pageable = PaginationUtils.createPageable(
                request != null ? request.getPageNo() : null,
                request != null ? request.getPageSize() : null
        );
        Page<BakongAccount> pageResult = repository.searchAccounts(search, pageable);
        return PaginationUtils.toPageResponse(pageResult, mapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public BakongAccountResponse getAccountById(UUID id) {
        log.info("Fetching Bakong account by ID: {}", id);
        BakongAccount account = repository.findById(id)
                .filter(a -> !a.isDeleted())
                .orElseThrow(() -> new RuntimeException("Bakong account not found with id: " + id));
        return mapper.toResponse(account);
    }

    @Override
    @Transactional(readOnly = true)
    public BakongAccountResponse getAccountById(BakongIdRequest request) {
        return getAccountById(request.getId());
    }

    @Override
    @Transactional
    public BakongAccountResponse createAccount(BakongAccountCreateRequest request) {
        log.info("Creating new Bakong account: {}", request.getAccountId());
        repository.findByAccountId(request.getAccountId()).ifPresent(existing -> {
            if (!existing.isDeleted()) {
                throw new IllegalArgumentException("Bakong account with ID '" + request.getAccountId() + "' already exists");
            }
        });

        // Enforce single active account rule if enabling this new account
        if (request.isEnabled() || request.isDefault()) {
            deactivateAllAccounts();
        }

        BakongAccount account = mapper.toEntity(request);
        account.setDefault(request.isEnabled() || request.isDefault());
        account.setEnabled(request.isEnabled() || request.isDefault());

        return mapper.toResponse(repository.save(account));
    }

    @Override
    @Transactional
    public BakongAccountResponse updateAccount(UUID id, BakongAccountUpdateRequest request) {
        log.info("Updating Bakong account ID: {}", id);
        BakongAccount account = repository.findById(id)
                .filter(a -> !a.isDeleted())
                .orElseThrow(() -> new RuntimeException("Bakong account not found with id: " + id));

        boolean willBeActive = request.isEnabled() || request.isDefault();
        if (willBeActive && (!account.isEnabled() || !account.isDefault())) {
            deactivateAllAccountsExcept(id);
        }

        mapper.updateEntityFromRequest(request, account);
        account.setDefault(willBeActive);
        account.setEnabled(willBeActive);

        return mapper.toResponse(repository.save(account));
    }

    @Override
    @Transactional
    public BakongAccountResponse updateAccount(BakongAccountUpdateRequest request) {
        return updateAccount(request.getId(), request);
    }

    @Override
    @Transactional
    public BakongAccountResponse deleteAccount(UUID id) {
        log.info("Deleting Bakong account ID: {}", id);
        BakongAccount account = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bakong account not found with id: " + id));
        account.setDeleted(true);
        account.setEnabled(false);
        account.setDefault(false);
        BakongAccount saved = repository.save(account);
        return mapper.toResponse(saved);
    }

    @Override
    @Transactional
    public BakongAccountResponse deleteAccount(BakongIdRequest request) {
        return deleteAccount(request.getId());
    }

    private void deactivateAllAccounts() {
        deactivateAllAccountsExcept(null);
    }

    private void deactivateAllAccountsExcept(UUID excludeId) {
        List<BakongAccount> all = repository.findAll();
        for (BakongAccount acc : all) {
            if (excludeId != null && acc.getId().equals(excludeId)) continue;
            if (acc.isEnabled() || acc.isDefault()) {
                acc.setEnabled(false);
                acc.setDefault(false);
                repository.save(acc);
            }
        }
    }
}
