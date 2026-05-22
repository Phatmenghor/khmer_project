package com.emenu.features.portfolio.mapper;

import com.emenu.features.portfolio.dto.request.*;
import com.emenu.features.portfolio.dto.response.*;
import com.emenu.features.portfolio.models.*;
import com.emenu.shared.dto.PaginationResponse;
import com.emenu.shared.mapper.PaginationMapper;
import org.mapstruct.*;
import org.springframework.data.domain.Page;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring",
        uses = {PaginationMapper.class},
        unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface PortfolioMapper {

    // ── Request → Review entity ───────────────────────────────────────────

    @Mapping(target = "id",         ignore = true)
    @Mapping(target = "profileId",  ignore = true)
    @Mapping(target = "businessId", ignore = true)
    @Mapping(target = "version",    ignore = true)
    @Mapping(target = "createdAt",  ignore = true)
    @Mapping(target = "updatedAt",  ignore = true)
    @Mapping(target = "createdBy",  ignore = true)
    @Mapping(target = "updatedBy",  ignore = true)
    @Mapping(target = "isDeleted",  ignore = true)
    @Mapping(target = "deletedAt",  ignore = true)
    @Mapping(target = "deletedBy",  ignore = true)
    PortfolioReview toReviewEntity(PortfolioReviewSubmitRequest request);

    // ── Request → Profile entity (update/upsert) ───────────────────────────

    @Mapping(target = "id",            ignore = true)
    @Mapping(target = "businessId",    ignore = true)
    @Mapping(target = "businessName",  ignore = true)
    @Mapping(target = "version",       ignore = true)
    @Mapping(target = "createdAt",     ignore = true)
    @Mapping(target = "updatedAt",     ignore = true)
    @Mapping(target = "createdBy",     ignore = true)
    @Mapping(target = "updatedBy",     ignore = true)
    @Mapping(target = "isDeleted",     ignore = true)
    @Mapping(target = "deletedAt",     ignore = true)
    @Mapping(target = "deletedBy",     ignore = true)
    @Mapping(target = "businessHours", ignore = true)
    @Mapping(target = "gallery",       ignore = true)
    @Mapping(target = "services",      ignore = true)
    @Mapping(target = "team",          ignore = true)
    @Mapping(target = "customStats",   ignore = true)
    @Mapping(target = "contactPhones", ignore = true)
    @Mapping(target = "features",      ignore = true)
    @Mapping(target = "industry",      ignore = true)
    @Mapping(target = "isPublished",   ignore = true)
    void applyProfileFields(@MappingTarget PortfolioProfile profile, PortfolioProfileSaveRequest request);

    // ── Request → Child entity ─────────────────────────────────────────────

    @Mapping(target = "id",           ignore = true)
    @Mapping(target = "profile",      ignore = true)
    @Mapping(target = "version",      ignore = true)
    @Mapping(target = "createdAt",    ignore = true)
    @Mapping(target = "updatedAt",    ignore = true)
    @Mapping(target = "createdBy",    ignore = true)
    @Mapping(target = "updatedBy",    ignore = true)
    @Mapping(target = "isDeleted",    ignore = true)
    @Mapping(target = "deletedAt",    ignore = true)
    @Mapping(target = "deletedBy",    ignore = true)
    @Mapping(target = "displayOrder", ignore = true)
    PortfolioHours toHoursEntity(PortfolioHoursRequest request);

    @Mapping(target = "id",           ignore = true)
    @Mapping(target = "profile",      ignore = true)
    @Mapping(target = "version",      ignore = true)
    @Mapping(target = "createdAt",    ignore = true)
    @Mapping(target = "updatedAt",    ignore = true)
    @Mapping(target = "createdBy",    ignore = true)
    @Mapping(target = "updatedBy",    ignore = true)
    @Mapping(target = "isDeleted",    ignore = true)
    @Mapping(target = "deletedAt",    ignore = true)
    @Mapping(target = "deletedBy",    ignore = true)
    @Mapping(target = "displayOrder", ignore = true)
    PortfolioGalleryItem toGalleryEntity(PortfolioGalleryItemRequest request);

    @Mapping(target = "id",           ignore = true)
    @Mapping(target = "profile",      ignore = true)
    @Mapping(target = "version",      ignore = true)
    @Mapping(target = "createdAt",    ignore = true)
    @Mapping(target = "updatedAt",    ignore = true)
    @Mapping(target = "createdBy",    ignore = true)
    @Mapping(target = "updatedBy",    ignore = true)
    @Mapping(target = "isDeleted",    ignore = true)
    @Mapping(target = "deletedAt",    ignore = true)
    @Mapping(target = "deletedBy",    ignore = true)
    @Mapping(target = "displayOrder", ignore = true)
    PortfolioServiceItem toServiceEntity(PortfolioServiceItemRequest request);

    @Mapping(target = "id",           ignore = true)
    @Mapping(target = "profile",      ignore = true)
    @Mapping(target = "version",      ignore = true)
    @Mapping(target = "createdAt",    ignore = true)
    @Mapping(target = "updatedAt",    ignore = true)
    @Mapping(target = "createdBy",    ignore = true)
    @Mapping(target = "updatedBy",    ignore = true)
    @Mapping(target = "isDeleted",    ignore = true)
    @Mapping(target = "deletedAt",    ignore = true)
    @Mapping(target = "deletedBy",    ignore = true)
    @Mapping(target = "displayOrder", ignore = true)
    PortfolioTeamMember toTeamEntity(PortfolioTeamMemberRequest request);

    @Mapping(target = "id",           ignore = true)
    @Mapping(target = "profile",      ignore = true)
    @Mapping(target = "version",      ignore = true)
    @Mapping(target = "createdAt",    ignore = true)
    @Mapping(target = "updatedAt",    ignore = true)
    @Mapping(target = "createdBy",    ignore = true)
    @Mapping(target = "updatedBy",    ignore = true)
    @Mapping(target = "isDeleted",    ignore = true)
    @Mapping(target = "deletedAt",    ignore = true)
    @Mapping(target = "deletedBy",    ignore = true)
    @Mapping(target = "displayOrder", ignore = true)
    PortfolioCustomStat toCustomStatEntity(PortfolioCustomStatRequest request);

    @Mapping(target = "id",           ignore = true)
    @Mapping(target = "profile",      ignore = true)
    @Mapping(target = "version",      ignore = true)
    @Mapping(target = "createdAt",    ignore = true)
    @Mapping(target = "updatedAt",    ignore = true)
    @Mapping(target = "createdBy",    ignore = true)
    @Mapping(target = "updatedBy",    ignore = true)
    @Mapping(target = "isDeleted",    ignore = true)
    @Mapping(target = "deletedAt",    ignore = true)
    @Mapping(target = "deletedBy",    ignore = true)
    @Mapping(target = "displayOrder", ignore = true)
    PortfolioFeature toFeatureEntity(PortfolioFeatureRequest request);

    @Mapping(target = "id",           ignore = true)
    @Mapping(target = "profile",      ignore = true)
    @Mapping(target = "version",      ignore = true)
    @Mapping(target = "createdAt",    ignore = true)
    @Mapping(target = "updatedAt",    ignore = true)
    @Mapping(target = "createdBy",    ignore = true)
    @Mapping(target = "updatedBy",    ignore = true)
    @Mapping(target = "isDeleted",    ignore = true)
    @Mapping(target = "deletedAt",    ignore = true)
    @Mapping(target = "deletedBy",    ignore = true)
    @Mapping(target = "displayOrder", ignore = true)
    PortfolioPhone toPhoneEntity(PortfolioPhoneRequest request);

    @Mapping(target = "id",           ignore = true)
    @Mapping(target = "profile",      ignore = true)
    @Mapping(target = "version",      ignore = true)
    @Mapping(target = "createdAt",    ignore = true)
    @Mapping(target = "updatedAt",    ignore = true)
    @Mapping(target = "createdBy",    ignore = true)
    @Mapping(target = "updatedBy",    ignore = true)
    @Mapping(target = "isDeleted",    ignore = true)
    @Mapping(target = "deletedAt",    ignore = true)
    @Mapping(target = "deletedBy",    ignore = true)
    @Mapping(target = "displayOrder", ignore = true)
    PortfolioSocialMedia toSocialMediaEntity(PortfolioSocialMediaRequest request);

    // ── Review response ──────────────────────────────────────────────────────

    PortfolioReviewAdminResponse toReviewAdminResponse(PortfolioReview review);

    List<PortfolioReviewAdminResponse> toReviewAdminResponseList(List<PortfolioReview> reviews);

    // ── Filtered list helpers (exclude soft-deleted children) ──────────────

    @Named("filterAndMapPhones")
    default List<PortfolioResponse.PhoneDto> filterAndMapPhones(List<PortfolioPhone> phones) {
        if (phones == null) return Collections.emptyList();
        return phones.stream()
                .filter(p -> !Boolean.TRUE.equals(p.getIsDeleted()))
                .map(this::toPhoneDto)
                .collect(Collectors.toList());
    }

    default PortfolioResponse.PhoneDto toPhoneDto(PortfolioPhone phone) {
        if (phone == null) return null;
        return PortfolioResponse.PhoneDto.builder()
                .id(phone.getId())
                .number(phone.getNumber())
                .build();
    }

    @Named("filterAndMapHours")
    default List<PortfolioResponse.HoursDto> filterAndMapHours(List<PortfolioHours> hours) {
        if (hours == null) return Collections.emptyList();
        return hours.stream()
                .filter(h -> !Boolean.TRUE.equals(h.getIsDeleted()))
                .map(this::toHoursDto)
                .collect(Collectors.toList());
    }

    PortfolioResponse.HoursDto toHoursDto(PortfolioHours hours);

    @Named("filterAndMapGallery")
    default List<PortfolioResponse.GalleryItemDto> filterAndMapGallery(List<PortfolioGalleryItem> items) {
        if (items == null) return Collections.emptyList();
        return items.stream()
                .filter(g -> !Boolean.TRUE.equals(g.getIsDeleted()))
                .map(this::toGalleryDto)
                .collect(Collectors.toList());
    }

    PortfolioResponse.GalleryItemDto toGalleryDto(PortfolioGalleryItem item);

    @Named("filterAndMapServices")
    default List<PortfolioResponse.ServiceItemDto> filterAndMapServices(List<PortfolioServiceItem> services) {
        if (services == null) return Collections.emptyList();
        return services.stream()
                .filter(s -> !Boolean.TRUE.equals(s.getIsDeleted()))
                .map(this::toServiceDto)
                .collect(Collectors.toList());
    }

    PortfolioResponse.ServiceItemDto toServiceDto(PortfolioServiceItem service);

    @Named("filterAndMapTeam")
    default List<PortfolioResponse.TeamMemberDto> filterAndMapTeam(List<PortfolioTeamMember> team) {
        if (team == null) return Collections.emptyList();
        return team.stream()
                .filter(m -> !Boolean.TRUE.equals(m.getIsDeleted()))
                .map(this::toTeamDto)
                .collect(Collectors.toList());
    }

    PortfolioResponse.TeamMemberDto toTeamDto(PortfolioTeamMember member);

    @Named("filterAndMapStats")
    default List<PortfolioResponse.CustomStatDto> filterAndMapStats(List<PortfolioCustomStat> stats) {
        if (stats == null) return Collections.emptyList();
        return stats.stream()
                .filter(s -> !Boolean.TRUE.equals(s.getIsDeleted()))
                .map(this::toCustomStatDto)
                .collect(Collectors.toList());
    }

    PortfolioResponse.CustomStatDto toCustomStatDto(PortfolioCustomStat stat);

    @Named("filterAndMapFeatures")
    default List<PortfolioResponse.FeatureDto> filterAndMapFeatures(List<PortfolioFeature> features) {
        if (features == null) return Collections.emptyList();
        return features.stream()
                .filter(f -> !Boolean.TRUE.equals(f.getIsDeleted()))
                .map(this::toFeatureDto)
                .collect(Collectors.toList());
    }

    PortfolioResponse.FeatureDto toFeatureDto(PortfolioFeature feature);

    @Named("filterAndMapSocialMedia")
    default List<PortfolioResponse.SocialMediaItemDto> filterAndMapSocialMedia(List<PortfolioSocialMedia> socialMedia) {
        if (socialMedia == null) return Collections.emptyList();
        return socialMedia.stream()
                .filter(s -> !Boolean.TRUE.equals(s.getIsDeleted()))
                .map(s -> PortfolioResponse.SocialMediaItemDto.builder()
                        .id(s.getId())
                        .name(s.getName())
                        .url(s.getUrl())
                        .displayOrder(s.getDisplayOrder())
                        .build())
                .collect(Collectors.toList());
    }

    @Named("filterPhoneNumbers")
    default List<String> filterPhoneNumbers(List<PortfolioPhone> phones) {
        if (phones == null) return Collections.emptyList();
        return phones.stream()
                .filter(p -> !Boolean.TRUE.equals(p.getIsDeleted()))
                .map(PortfolioPhone::getNumber)
                .collect(Collectors.toList());
    }

    // ── Profile → Response ──────────────────────────────────────────────────
    // Flat profile fields are mapped to nested contact/socialMedia/stats DTOs.
    // reviewStats is computed separately by the service and set after mapping.
    // Collections are filtered to exclude soft-deleted children, ordered by
    // displayOrder ASC (maintained by @OrderBy on the entity relation).

    @Mapping(source = "contactEmail",      target = "contact.email")
    @Mapping(source = "contactPhone",      target = "contact.phone")
    @Mapping(source = "contactPhones",     target = "contact.phones",      qualifiedByName = "filterAndMapPhones")
    @Mapping(source = "contactWhatsapp",   target = "contact.whatsapp")
    @Mapping(source = "contactTelegram",   target = "contact.telegram")
    @Mapping(source = "address",           target = "contact.address")
    @Mapping(source = "mapLink",           target = "contact.mapLink")
    @Mapping(source = "socialMedia",       target = "socialMedia",         qualifiedByName = "filterAndMapSocialMedia")
    @Mapping(source = "customStats",       target = "stats",               qualifiedByName = "filterAndMapStats")
    @Mapping(source = "businessHours",     target = "businessHours",       qualifiedByName = "filterAndMapHours")
    @Mapping(source = "gallery",           target = "gallery",             qualifiedByName = "filterAndMapGallery")
    @Mapping(source = "services",          target = "services",            qualifiedByName = "filterAndMapServices")
    @Mapping(source = "team",              target = "team",                qualifiedByName = "filterAndMapTeam")
    @Mapping(source = "features",          target = "features",            qualifiedByName = "filterAndMapFeatures")
    @Mapping(target = "reviewStats",       ignore = true)
    @Mapping(target = "createdAt", expression = "java(profile.getCreatedAt() != null ? profile.getCreatedAt().toString() : null)")
    @Mapping(target = "updatedAt", expression = "java(profile.getUpdatedAt() != null ? profile.getUpdatedAt().toString() : null)")
    PortfolioResponse toResponse(PortfolioProfile profile);

    // ── Pagination ──────────────────────────────────────────────────────────

    default PaginationResponse<PortfolioReviewAdminResponse> toReviewPaginationResponse(
            Page<PortfolioReview> page, PaginationMapper paginationMapper) {
        return paginationMapper.toPaginationResponse(page, this::toReviewAdminResponseList);
    }
}
