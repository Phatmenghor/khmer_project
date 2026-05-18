package com.emenu.shared.pagination;

import com.emenu.exception.custom.ValidationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

@Slf4j
public class PaginationUtils {

    private static final int MAX_PAGE_SIZE = 101;
    private static final int DEFAULT_PAGE_SIZE = 15;
    private static final int DEFAULT_PAGE_NUMBER = 0;

    public static void validatePagination(Integer pageNo, Integer pageSize) {
        if (pageNo != null && pageNo < 0) {
            throw new ValidationException("Page number must be greater than or equal to 0");
        }
        if (pageSize != null && pageSize <= 0) {
            throw new ValidationException("Page size must be greater than 0");
        }
        if (pageSize != null && pageSize >= MAX_PAGE_SIZE) {
            throw new ValidationException("Page size cannot exceed " + MAX_PAGE_SIZE);
        }
    }

    private static int normalizePageNumber(Integer pageNo) {
        if (pageNo == null || pageNo <= 0) {
            return DEFAULT_PAGE_NUMBER;
        }
        return pageNo - 1;
    }

    private static int normalizePageSize(Integer pageSize) {
        return (pageSize == null) ? DEFAULT_PAGE_SIZE : pageSize;
    }

    public static Pageable createPageable(Integer pageNo, Integer pageSize, String sortBy, String sortDirection) {
        int normalizedPageNo = normalizePageNumber(pageNo);
        int normalizedPageSize = normalizePageSize(pageSize);
        sortBy = (sortBy == null || sortBy.isEmpty()) ? "createdAt" : sortBy;

        validatePagination(normalizedPageNo, normalizedPageSize);

        Sort.Direction direction = Sort.Direction.DESC;
        if (sortDirection != null && sortDirection.equalsIgnoreCase("ASC")) {
            direction = Sort.Direction.ASC;
        }

        return PageRequest.of(normalizedPageNo, normalizedPageSize, Sort.by(direction, sortBy));
    }

    public static Pageable createPageable(Integer pageNo, Integer pageSize) {
        int normalizedPageNo = normalizePageNumber(pageNo);
        int normalizedPageSize = normalizePageSize(pageSize);

        validatePagination(normalizedPageNo, normalizedPageSize);

        return PageRequest.of(normalizedPageNo, normalizedPageSize);
    }

    public static Pageable createPageableForNativeQuery(Integer pageNo, Integer pageSize, String sortBy, String sortDirection) {
        int normalizedPageNo = normalizePageNumber(pageNo);
        int normalizedPageSize = normalizePageSize(pageSize);
        sortBy = (sortBy == null || sortBy.isEmpty()) ? "createdAt" : sortBy;

        validatePagination(normalizedPageNo, normalizedPageSize);

        // Convert camelCase to snake_case for native SQL queries
        String snakeCaseSortBy = convertToSnakeCase(sortBy);

        Sort.Direction direction = Sort.Direction.DESC;
        if (sortDirection != null && sortDirection.equalsIgnoreCase("ASC")) {
            direction = Sort.Direction.ASC;
        }

        return PageRequest.of(normalizedPageNo, normalizedPageSize, Sort.by(direction, snakeCaseSortBy));
    }

    public static Sort createSort(String sortBy, String sortDirection) {
        sortBy = (sortBy == null || sortBy.isEmpty()) ? "createdAt" : sortBy;
        Sort.Direction direction = Sort.Direction.DESC;
        if (sortDirection != null && sortDirection.equalsIgnoreCase("ASC")) {
            direction = Sort.Direction.ASC;
        }
        return Sort.by(direction, sortBy);
    }

    private static String convertToSnakeCase(String camelCase) {
        if (camelCase == null || camelCase.isEmpty()) {
            return "created_at";
        }

        // Regex: Insert underscore between lowercase and uppercase letters
        return camelCase.replaceAll("([a-z])([A-Z])", "$1_$2").toLowerCase();
    }
}