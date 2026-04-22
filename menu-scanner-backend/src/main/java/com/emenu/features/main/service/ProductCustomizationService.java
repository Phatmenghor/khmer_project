package com.emenu.features.main.service;

import com.emenu.features.main.dto.request.ProductCustomizationCreateDto;
import com.emenu.features.main.dto.request.ProductCustomizationGroupCreateDto;
import com.emenu.features.main.dto.response.ProductCustomizationDto;
import com.emenu.features.main.dto.response.ProductCustomizationGroupDto;
import com.emenu.features.main.mapper.ProductCustomizationGroupMapper;
import com.emenu.features.main.mapper.ProductCustomizationMapper;
import com.emenu.features.main.models.ProductCustomization;
import com.emenu.features.main.models.ProductCustomizationGroup;
import com.emenu.features.main.repository.ProductCustomizationGroupRepository;
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

    private final ProductCustomizationGroupRepository customizationGroupRepository;
    private final ProductCustomizationRepository customizationRepository;
    private final ProductCustomizationGroupMapper groupMapper;
    private final ProductCustomizationMapper customizationMapper;

    // ============= Customization Group Operations =============

    public ProductCustomizationGroupDto createCustomizationGroup(ProductCustomizationGroupCreateDto request) {
        log.info("Creating customization group for product: {} - Name: {}",
            request.getProductId(), request.getName());

        ProductCustomizationGroup group = groupMapper.toEntity(request);
        ProductCustomizationGroup saved = customizationGroupRepository.save(group);

        log.info("Customization group created successfully - ID: {}", saved.getId());
        return groupMapper.toDto(saved);
    }

    public ProductCustomizationGroupDto getCustomizationGroupById(UUID groupId) {
        log.debug("Fetching customization group: {}", groupId);

        ProductCustomizationGroup group = customizationGroupRepository.findById(groupId)
            .orElseThrow(() -> new RuntimeException("Customization group not found: " + groupId));

        return groupMapper.toDto(group);
    }

    public List<ProductCustomizationGroupDto> getProductCustomizationGroups(UUID productId) {
        log.info("Fetching customization groups for product: {}", productId);

        List<ProductCustomizationGroup> groups = customizationGroupRepository.findByProductId(productId);

        return groups.stream()
            .map(groupMapper::toDto)
            .collect(Collectors.toList());
    }

    public List<ProductCustomizationGroupDto> getProductCustomizationGroupsActive(UUID productId) {
        log.info("Fetching active customization groups for product: {}", productId);

        List<ProductCustomizationGroup> groups = customizationGroupRepository
            .findByProductIdAndStatus(productId, "ACTIVE");

        return groups.stream()
            .map(groupMapper::toDto)
            .collect(Collectors.toList());
    }

    public ProductCustomizationGroupDto updateCustomizationGroup(UUID groupId, ProductCustomizationGroupCreateDto request) {
        log.info("Updating customization group: {}", groupId);

        ProductCustomizationGroup group = customizationGroupRepository.findById(groupId)
            .orElseThrow(() -> new RuntimeException("Customization group not found: " + groupId));

        groupMapper.updateEntity(request, group);
        ProductCustomizationGroup updated = customizationGroupRepository.save(group);

        log.info("Customization group updated successfully - ID: {}", updated.getId());
        return groupMapper.toDto(updated);
    }

    public void deleteCustomizationGroup(UUID groupId) {
        log.info("Deleting customization group: {}", groupId);

        ProductCustomizationGroup group = customizationGroupRepository.findById(groupId)
            .orElseThrow(() -> new RuntimeException("Customization group not found: " + groupId));

        customizationGroupRepository.delete(group);

        log.info("Customization group deleted successfully - ID: {}", groupId);
    }

    // ============= Customization Option Operations =============

    public ProductCustomizationDto createCustomization(ProductCustomizationCreateDto request) {
        log.info("Creating customization option - Group: {}, Name: {}",
            request.getProductCustomizationGroupId(), request.getName());

        // Verify group exists
        customizationGroupRepository.findById(request.getProductCustomizationGroupId())
            .orElseThrow(() -> new RuntimeException("Customization group not found: " + request.getProductCustomizationGroupId()));

        ProductCustomization customization = customizationMapper.toEntity(request);
        ProductCustomization saved = customizationRepository.save(customization);

        log.info("Customization option created successfully - ID: {}", saved.getId());
        return customizationMapper.toDto(saved);
    }

    public ProductCustomizationDto getCustomizationById(UUID customizationId) {
        log.debug("Fetching customization: {}", customizationId);

        ProductCustomization customization = customizationRepository.findById(customizationId)
            .orElseThrow(() -> new RuntimeException("Customization not found: " + customizationId));

        return customizationMapper.toDto(customization);
    }

    public List<ProductCustomizationDto> getGroupCustomizations(UUID groupId) {
        log.info("Fetching customizations for group: {}", groupId);

        List<ProductCustomization> customizations = customizationRepository
            .findByProductCustomizationGroupIdOrderBySortOrder(groupId);

        return customizations.stream()
            .map(customizationMapper::toDto)
            .collect(Collectors.toList());
    }

    public List<ProductCustomizationDto> getGroupCustomizationsActive(UUID groupId) {
        log.info("Fetching active customizations for group: {}", groupId);

        List<ProductCustomization> customizations = customizationRepository
            .findByProductCustomizationGroupIdAndStatus(groupId, "ACTIVE");

        return customizations.stream()
            .map(customizationMapper::toDto)
            .collect(Collectors.toList());
    }

    public ProductCustomizationDto updateCustomization(UUID customizationId, ProductCustomizationCreateDto request) {
        log.info("Updating customization: {}", customizationId);

        ProductCustomization customization = customizationRepository.findById(customizationId)
            .orElseThrow(() -> new RuntimeException("Customization not found: " + customizationId));

        customizationMapper.updateEntity(request, customization);
        ProductCustomization updated = customizationRepository.save(customization);

        log.info("Customization updated successfully - ID: {}", updated.getId());
        return customizationMapper.toDto(updated);
    }

    public void deleteCustomization(UUID customizationId) {
        log.info("Deleting customization: {}", customizationId);

        ProductCustomization customization = customizationRepository.findById(customizationId)
            .orElseThrow(() -> new RuntimeException("Customization not found: " + customizationId));

        customizationRepository.delete(customization);

        log.info("Customization deleted successfully - ID: {}", customizationId);
    }

    // ============= Utility Methods =============

    public boolean groupExists(UUID groupId) {
        return customizationGroupRepository.existsById(groupId);
    }

    public boolean customizationExists(UUID customizationId) {
        return customizationRepository.existsById(customizationId);
    }

    public long getCustomizationCountForGroup(UUID groupId) {
        return customizationRepository.findByProductCustomizationGroupId(groupId).size();
    }
}
