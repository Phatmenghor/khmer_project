package com.emenu.features.main.service;

import com.emenu.features.main.dto.request.ProductCustomizationCreateDto;
import com.emenu.features.main.dto.response.ProductCustomizationDto;
import com.emenu.features.main.mapper.ProductCustomizationMapper;
import com.emenu.features.main.models.ProductCustomization;
import com.emenu.features.main.repository.ProductCustomizationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ProductCustomizationService {

    private final ProductCustomizationRepository customizationRepository;
    private final ProductCustomizationMapper customizationMapper;

    public ProductCustomizationDto createCustomization(ProductCustomizationCreateDto request) {
        log.info("Creating add-on for product: {} - Name: {}", request.getProductId(), request.getName());

        ProductCustomization customization = customizationMapper.toEntity(request);
        ProductCustomization saved = customizationRepository.save(customization);

        log.info("Add-on created successfully - ID: {}", saved.getId());
        return customizationMapper.toDto(saved);
    }

    public ProductCustomizationDto getCustomizationById(UUID customizationId) {
        log.debug("Fetching add-on: {}", customizationId);

        ProductCustomization customization = customizationRepository.findById(customizationId)
            .orElseThrow(() -> new RuntimeException("Add-on not found: " + customizationId));

        return customizationMapper.toDto(customization);
    }

    public List<ProductCustomizationDto> getProductCustomizations(UUID productId) {
        log.info("Fetching add-ons for product: {}", productId);

        List<ProductCustomization> customizations = customizationRepository.findByProductIdOrderByPriceAdjustment(productId);

        return customizations.stream()
            .map(customizationMapper::toDto)
            .collect(Collectors.toList());
    }

    public List<ProductCustomizationDto> getProductCustomizationsActive(UUID productId) {
        log.info("Fetching active add-ons for product: {}", productId);

        List<ProductCustomization> customizations = customizationRepository
            .findByProductIdAndStatus(productId, "ACTIVE");

        return customizations.stream()
            .map(customizationMapper::toDto)
            .collect(Collectors.toList());
    }

    public ProductCustomizationDto updateCustomization(UUID customizationId, ProductCustomizationCreateDto request) {
        log.info("Updating add-on: {}", customizationId);

        ProductCustomization customization = customizationRepository.findById(customizationId)
            .orElseThrow(() -> new RuntimeException("Add-on not found: " + customizationId));

        customizationMapper.updateEntity(request, customization);
        ProductCustomization updated = customizationRepository.save(customization);

        log.info("Add-on updated successfully - ID: {}", updated.getId());
        return customizationMapper.toDto(updated);
    }

    public void deleteCustomization(UUID customizationId) {
        log.info("Deleting add-on: {}", customizationId);

        ProductCustomization customization = customizationRepository.findById(customizationId)
            .orElseThrow(() -> new RuntimeException("Add-on not found: " + customizationId));

        customizationRepository.delete(customization);

        log.info("Add-on deleted successfully - ID: {}", customizationId);
    }

    public boolean customizationExists(UUID customizationId) {
        return customizationRepository.existsById(customizationId);
    }
}
