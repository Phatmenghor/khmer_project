package com.emenu.features.order.mapper;

import com.emenu.features.order.dto.response.TableSessionResponse;
import com.emenu.features.order.models.TableSession;
import com.emenu.features.order.models.TableSessionItem;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface TableSessionMapper {

    TableSessionResponse toResponse(TableSession session);

    List<TableSessionResponse> toResponseList(List<TableSession> sessions);

    TableSessionResponse.TableSessionItemResponse toItemResponse(TableSessionItem item);

    @AfterMapping
    default void populateRounds(TableSession session, @MappingTarget TableSessionResponse response) {
        if (response == null || session == null) return;

        List<TableSessionResponse.TableSessionItemResponse> itemResponses = response.getItems();
        if (itemResponses == null || itemResponses.isEmpty()) {
            response.setRounds(new ArrayList<>());
            List<TableSessionResponse.TableSessionOrderRowResponse> emptyRoundRows = new ArrayList<>();
            emptyRoundRows.add(TableSessionResponse.TableSessionOrderRowResponse.builder()
                    .id(session.getId().toString())
                    .sessionId(session.getId())
                    .tableNumber(session.getTableNumber())
                    .sessionNumber(session.getSessionNumber())
                    .round(1)
                    .roundItemsCount(0)
                    .roundTotal(BigDecimal.ZERO)
                    .status(session.getStatus())
                    .startedAt(session.getStartedAt())
                    .items(new ArrayList<>())
                    .build());
            response.setRoundRows(emptyRoundRows);
            return;
        }

        Map<Integer, List<TableSessionResponse.TableSessionItemResponse>> roundGroupMap = itemResponses.stream()
                .collect(Collectors.groupingBy(i -> i.getOrderRound() != null ? i.getOrderRound() : 1));

        List<TableSessionResponse.TableSessionRoundResponse> roundsList = roundGroupMap.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> {
                    Integer round = entry.getKey();
                    List<TableSessionResponse.TableSessionItemResponse> roundItems = entry.getValue();

                    int roundItemsCount = roundItems.stream()
                            .mapToInt(i -> i.getQuantity() != null ? i.getQuantity() : 1)
                            .sum();

                    BigDecimal roundTotal = roundItems.stream()
                            .map(i -> i.getTotalPrice() != null ? i.getTotalPrice() : BigDecimal.ZERO)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    return TableSessionResponse.TableSessionRoundResponse.builder()
                            .orderRound(round)
                            .roundItemsCount(roundItemsCount)
                            .roundTotal(roundTotal)
                            .createdAt(roundItems.get(0).getCreatedAt() != null ? roundItems.get(0).getCreatedAt() : session.getStartedAt())
                            .items(roundItems)
                            .build();
                })
                .collect(Collectors.toList());

        BigDecimal subtotal = itemResponses.stream()
                .map(i -> i.getTotalPrice() != null ? i.getTotalPrice() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal custTotal = itemResponses.stream()
                .map(i -> i.getCustomizationTotal() != null ? i.getCustomizationTotal() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal taxableBase = subtotal.add(custTotal);
        BigDecimal taxRate = response.getTaxRate() != null ? response.getTaxRate() : BigDecimal.ZERO;
        BigDecimal taxAmount = taxableBase.multiply(taxRate).divide(new BigDecimal("100.00"), 2, RoundingMode.HALF_UP);
        BigDecimal grandTotal = taxableBase.add(taxAmount);

        response.setSubtotal(subtotal);
        response.setCustomizationTotal(custTotal);
        response.setTaxRate(taxRate);
        response.setTaxAmount(taxAmount);
        if (response.getDiscountAmount() == null) {
            response.setDiscountAmount(BigDecimal.ZERO);
        }
        response.setTotalAmount(taxableBase);
        response.setGrandTotal(grandTotal);

        response.setRounds(roundsList);

        List<TableSessionResponse.TableSessionOrderRowResponse> roundRows = roundsList.stream()
                .map(r -> {
                    boolean isRoundPending = r.getItems() != null && r.getItems().stream()
                            .anyMatch(i -> "PENDING".equalsIgnoreCase(i.getStatus()));
                    String roundStatus = isRoundPending ? "PENDING" : "ACTIVE";

                    return TableSessionResponse.TableSessionOrderRowResponse.builder()
                            .id(session.getId().toString() + "-round-" + r.getOrderRound())
                            .sessionId(session.getId())
                            .tableNumber(session.getTableNumber())
                            .sessionNumber(session.getSessionNumber())
                            .round(r.getOrderRound())
                            .roundItemsCount(r.getRoundItemsCount())
                            .roundTotal(r.getRoundTotal())
                            .status(roundStatus)
                            .startedAt(r.getCreatedAt() != null ? r.getCreatedAt() : session.getStartedAt())
                            .items(r.getItems())
                            .build();
                })
                .collect(Collectors.toList());

        response.setRoundRows(roundRows);
    }
}
