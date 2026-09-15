package com.emenu.features.bakong.service.impl;

import com.emenu.features.bakong.dto.BakongIdRequest;
import com.emenu.features.bakong.dto.BakongTransactionDetailResponse;
import com.emenu.features.bakong.dto.BakongTransactionLogResponse;
import com.emenu.features.bakong.dto.BakongTransactionResponse;
import com.emenu.features.bakong.dto.BakongTransactionSearchRequest;
import com.emenu.features.bakong.dto.BakongVerifyRequest;
import com.emenu.features.bakong.dto.BakongVerifyResponse;
import com.emenu.features.bakong.dto.CheckHashRequest;
import com.emenu.features.bakong.dto.CheckTransactionRequest;
import com.emenu.features.bakong.mapper.BakongTransactionMapper;
import com.emenu.features.bakong.model.BakongTransaction;
import com.emenu.features.bakong.repository.BakongTransactionLogRepository;
import com.emenu.features.bakong.repository.BakongTransactionRepository;
import com.emenu.features.bakong.service.BakongService;
import com.emenu.features.bakong.service.BakongTransactionService;
import com.emenu.shared.dto.PageResponse;
import com.emenu.shared.pagination.PaginationUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Mono;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BakongTransactionServiceImpl implements BakongTransactionService {

    private final BakongTransactionRepository transactionRepository;
    private final BakongTransactionLogRepository logRepository;
    private final BakongService bakongService;
    private final BakongTransactionMapper mapper;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<BakongTransactionResponse> searchTransactions(BakongTransactionSearchRequest request) {
        log.info("Searching Bakong transactions with request: {}", request);
        String search = (request != null) ? PaginationUtils.extractSearch(request.getSearch()) : null;
        Pageable pageable = PaginationUtils.createPageable(
                request != null ? request.getPageNo() : null,
                request != null ? request.getPageSize() : null
        );
        Page<BakongTransaction> pageResult = transactionRepository.searchTransactions(search, pageable);
        return PaginationUtils.toPageResponse(pageResult, mapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public BakongTransactionDetailResponse getTransactionDetail(BakongIdRequest request) {
        return getTransactionDetail(request.getId());
    }

    @Override
    @Transactional(readOnly = true)
    public BakongTransactionDetailResponse getTransactionDetail(UUID id) {
        log.info("Fetching Bakong transaction detail for ID: {}", id);
        BakongTransaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bakong transaction not found with id: " + id));

        List<BakongTransactionLogResponse> logs = logRepository.findByTransactionRefIdOrderByCreatedAtDesc(id).stream()
                .map(mapper::toLogResponse)
                .collect(Collectors.toList());

        if (logs.isEmpty() && transaction.getTransactionId() != null) {
            logs = logRepository.findByTransactionIdOrderByCreatedAtDesc(transaction.getTransactionId()).stream()
                    .map(mapper::toLogResponse)
                    .collect(Collectors.toList());
        }

        return BakongTransactionDetailResponse.builder()
                .transaction(mapper.toResponse(transaction))
                .logs(logs)
                .build();
    }

    @Override
    public Mono<BakongVerifyResponse> verifyTransaction(BakongVerifyRequest request, String requestUrl) {
        String txnId = request != null ? request.getTransactionId() : null;
        log.info("Verifying Bakong transaction against NBC upstream API: transactionId='{}'", txnId);

        if (txnId != null && !txnId.isBlank()) {
            CheckTransactionRequest checkReq = new CheckTransactionRequest(txnId);
            return bakongService.checkTransactionStatus(checkReq, requestUrl)
                    .map(res -> buildUpstreamVerifyResponse(txnId));
        } else {
            return Mono.error(new IllegalArgumentException("Transaction ID is required for verification"));
        }
    }

    private BakongVerifyResponse buildUpstreamVerifyResponse(String transactionId) {
        Optional<BakongTransaction> updatedOpt = Optional.empty();
        if (transactionId != null) {
            updatedOpt = transactionRepository.findByTransactionId(transactionId)
                    .or(() -> transactionRepository.findByMd5(transactionId));
        }

        BakongTransaction tx = updatedOpt.orElse(null);
        List<BakongTransactionLogResponse> logs = (tx != null && tx.getTransactionId() != null)
                ? logRepository.findByTransactionIdOrderByCreatedAtDesc(tx.getTransactionId()).stream().map(mapper::toLogResponse).collect(Collectors.toList())
                : Collections.emptyList();

        return BakongVerifyResponse.builder()
                .searchedLocal(false)
                .source("NBC_UPSTREAM")
                .message("Queried upstream NBC Bakong API directly")
                .transaction(tx != null ? mapper.toResponse(tx) : null)
                .logs(logs)
                .build();
    }
}
