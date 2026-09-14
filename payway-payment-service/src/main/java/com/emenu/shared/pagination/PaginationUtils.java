package com.emenu.shared.pagination;

import com.emenu.shared.dto.PageResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

public final class PaginationUtils {

    private PaginationUtils() {}

    private static final int MAX_PAGE_SIZE = 100;
    private static final int DEFAULT_PAGE_SIZE = 15;
    private static final int DEFAULT_PAGE_NUMBER = 0;

    public static String extractSearch(String search) {
        return (search != null && !search.isBlank()) ? search.trim() : null;
    }

    private static int normalizePageNumber(Integer pageNo) {
        if (pageNo == null || pageNo <= 0) {
            return DEFAULT_PAGE_NUMBER;
        }
        return pageNo - 1;
    }

    private static int normalizePageSize(Integer pageSize) {
        if (pageSize == null || pageSize <= 0) {
            return DEFAULT_PAGE_SIZE;
        }
        return Math.min(pageSize, MAX_PAGE_SIZE);
    }

    public static Pageable createPageable(Integer pageNo, Integer pageSize, String sortBy, String sortDirection) {
        int normalizedPageNo = normalizePageNumber(pageNo);
        int normalizedPageSize = normalizePageSize(pageSize);
        sortBy = (sortBy == null || sortBy.isBlank()) ? "createdAt" : sortBy;

        Sort.Direction direction = Sort.Direction.DESC;
        if (sortDirection != null && sortDirection.equalsIgnoreCase("ASC")) {
            direction = Sort.Direction.ASC;
        }

        return PageRequest.of(normalizedPageNo, normalizedPageSize, Sort.by(direction, sortBy));
    }

    public static Pageable createPageable(Integer pageNo, Integer pageSize) {
        return createPageable(pageNo, pageSize, "createdAt", "DESC");
    }

    public static <T, R> PageResponse<R> toPageResponse(Page<T> pageResult, List<R> content) {
        return PageResponse.<R>builder()
                .content(content)
                .pageNo(pageResult.getNumber() + 1)
                .pageSize(pageResult.getSize())
                .totalElements(pageResult.getTotalElements())
                .totalPages(pageResult.getTotalPages())
                .last(pageResult.isLast())
                .build();
    }

    public static <T, R> PageResponse<R> toPageResponse(Page<T> pageResult, Function<T, R> mapper) {
        List<R> content = pageResult.getContent().stream()
                .map(mapper)
                .collect(Collectors.toList());
        return toPageResponse(pageResult, content);
    }
}
