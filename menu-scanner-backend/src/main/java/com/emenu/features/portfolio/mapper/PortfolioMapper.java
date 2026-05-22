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
    // profileId and businessId are set by the service after mapping.

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
    // businessId and businessName are resolved by the service and set after.
    // Collection fields are rebuilt separately via rebuildCollections().

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
    @Mapping(target = "contactPhones", defaultExpression = "java(new java.util.ArrayList<>())")
    @Mapping(target = "features",      defaultExpression = "java(new java.util.ArrayList<>())")
    @Mapping(target = "industry",      ignore = true)
    @Mapping(target = "isPublished",   ignore = true)
    void applyProfileFields(@MappingTarget PortfolioProfile profile, PortfolioProfileSaveRequest request);

    // ── Child entity → DTO ─────────────────────────────────────────────────

    PortfolioPublicResponse.HoursDto toHoursDto(PortfolioHours hours);

    PortfolioPublicResponse.GalleryItemDto toGalleryDto(PortfolioGalleryItem item);

    PortfolioPublicResponse.ServiceItemDto toServiceDto(PortfolioServiceItem service);

    PortfolioPublicResponse.TeamMemberDto toTeamDto(PortfolioTeamMember member);

    PortfolioPublicResponse.CustomStatDto toCustomStatDto(PortfolioCustomStat stat);

    PortfolioReviewAdminResponse toReviewAdminResponse(PortfolioReview review);

    List<PortfolioReviewAdminResponse> toReviewAdminResponseList(List<PortfolioReview> reviews);

    // ── Request → Child entity ─────────────────────────────────────────────
    // BaseUUIDEntity fields are all excluded via IGNORE policy.
    // profile reference is set by the service after mapping.

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
    @Mapping(target = "displayOrder", defaultValue = "0")
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
    @Mapping(target = "displayOrder", defaultValue = "0")
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
    @Mapping(target = "displayOrder", defaultValue = "0")
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
    @Mapping(target = "displayOrder", defaultValue = "0")
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
    @Mapping(target = "displayOrder", defaultValue = "0")
    PortfolioCustomStat toCustomStatEntity(PortfolioCustomStatRequest request);

    // ── Filtered list helpers (exclude soft-deleted children) ──────────────

    @Named("filterAndMapHours")
    default List<PortfolioPublicResponse.HoursDto> filterAndMapHours(List<PortfolioHours> hours) {
        if (hours == null) return Collections.emptyList();
        return hours.stream()
                .filter(h -> !Boolean.TRUE.equals(h.getIsDeleted()))
                .map(this::toHoursDto)
                .collect(Collectors.toList());
    }

    @Named("filterAndMapHoursUnified")
    default List<PortfolioResponse.HoursDto> filterAndMapHoursUnified(List<PortfolioHours> hours) {
        if (hours == null) return Collections.emptyList();
        return hours.stream()
                .filter(h -> !Boolean.TRUE.equals(h.getIsDeleted()))
                .map(this::toHoursDtoUnified)
                .collect(Collectors.toList());
    }

    @Named("filterAndMapGallery")
    default List<PortfolioPublicResponse.GalleryItemDto> filterAndMapGallery(List<PortfolioGalleryItem> items) {
        if (items == null) return Collections.emptyList();
        return items.stream()
                .filter(g -> !Boolean.TRUE.equals(g.getIsDeleted()))
                .map(this::toGalleryDto)
                .collect(Collectors.toList());
    }

    @Named("filterAndMapGalleryUnified")
    default List<PortfolioResponse.GalleryItemDto> filterAndMapGalleryUnified(List<PortfolioGalleryItem> items) {
        if (items == null) return Collections.emptyList();
        return items.stream()
                .filter(g -> !Boolean.TRUE.equals(g.getIsDeleted()))
                .map(this::toGalleryDtoUnified)
                .collect(Collectors.toList());
    }

    @Named("filterAndMapServices")
    default List<PortfolioPublicResponse.ServiceItemDto> filterAndMapServices(List<PortfolioServiceItem> services) {
        if (services == null) return Collections.emptyList();
        return services.stream()
                .filter(s -> !Boolean.TRUE.equals(s.getIsDeleted()))
                .map(this::toServiceDto)
                .collect(Collectors.toList());
    }

    @Named("filterAndMapServicesUnified")
    default List<PortfolioResponse.ServiceItemDto> filterAndMapServicesUnified(List<PortfolioServiceItem> services) {
        if (services == null) return Collections.emptyList();
        return services.stream()
                .filter(s -> !Boolean.TRUE.equals(s.getIsDeleted()))
                .map(this::toServiceDtoUnified)
                .collect(Collectors.toList());
    }

    @Named("filterAndMapTeam")
    default List<PortfolioPublicResponse.TeamMemberDto> filterAndMapTeam(List<PortfolioTeamMember> team) {
        if (team == null) return Collections.emptyList();
        return team.stream()
                .filter(m -> !Boolean.TRUE.equals(m.getIsDeleted()))
                .map(this::toTeamDto)
                .collect(Collectors.toList());
    }

    @Named("filterAndMapTeamUnified")
    default List<PortfolioResponse.TeamMemberDto> filterAndMapTeamUnified(List<PortfolioTeamMember> team) {
        if (team == null) return Collections.emptyList();
        return team.stream()
                .filter(m -> !Boolean.TRUE.equals(m.getIsDeleted()))
                .map(this::toTeamDtoUnified)
                .collect(Collectors.toList());
    }

    @Named("filterAndMapStats")
    default List<PortfolioPublicResponse.CustomStatDto> filterAndMapStats(List<PortfolioCustomStat> stats) {
        if (stats == null) return Collections.emptyList();
        return stats.stream()
                .filter(s -> !Boolean.TRUE.equals(s.getIsDeleted()))
                .map(this::toCustomStatDto)
                .collect(Collectors.toList());
    }

    @Named("filterAndMapStatsUnified")
    default List<PortfolioResponse.CustomStatDto> filterAndMapStatsUnified(List<PortfolioCustomStat> stats) {
        if (stats == null) return Collections.emptyList();
        return stats.stream()
                .filter(s -> !Boolean.TRUE.equals(s.getIsDeleted()))
                .map(this::toCustomStatDtoUnified)
                .collect(Collectors.toList());
    }

    // ── Profile → Public/Admin response ────────────────────────────────────
    // Flat profile fields are mapped to nested contact/socialMedia/stats DTOs.
    // reviewStats is computed separately by the service and set after mapping.
    // Collections are filtered to exclude soft-deleted children, ordered by
    // displayOrder ASC (maintained by @OrderBy on the entity relation).

    @Mapping(source = "contactEmail",      target = "contact.email")
    @Mapping(source = "contactPhone",      target = "contact.phone")
    @Mapping(source = "contactPhones",     target = "contact.phones")
    @Mapping(source = "contactWhatsapp",   target = "contact.whatsapp")
    @Mapping(source = "contactTelegram",   target = "contact.telegram")
    @Mapping(source = "address",           target = "contact.address")
    @Mapping(source = "mapLink",           target = "contact.mapLink")
    @Mapping(source = "socialFacebook",    target = "socialMedia.facebook")
    @Mapping(source = "socialInstagram",   target = "socialMedia.instagram")
    @Mapping(source = "socialTwitter",     target = "socialMedia.twitter")
    @Mapping(source = "socialLinkedin",    target = "socialMedia.linkedin")
    @Mapping(source = "socialYoutube",     target = "socialMedia.youtube")
    @Mapping(source = "socialTiktok",      target = "socialMedia.tiktok")
    @Mapping(source = "socialWebsite",     target = "socialMedia.website")
    @Mapping(source = "yearsInBusiness",   target = "stats.yearsInBusiness")
    @Mapping(source = "customersServed",   target = "stats.customersServed")
    @Mapping(source = "customStats",       target = "stats.customStats",  qualifiedByName = "filterAndMapStats")
    @Mapping(source = "businessHours",     target = "businessHours",      qualifiedByName = "filterAndMapHours")
    @Mapping(source = "gallery",           target = "gallery",             qualifiedByName = "filterAndMapGallery")
    @Mapping(source = "services",          target = "services",            qualifiedByName = "filterAndMapServices")
    @Mapping(source = "team",              target = "team",                qualifiedByName = "filterAndMapTeam")
    @Mapping(target = "reviewStats",       ignore = true)
    @Mapping(target = "createdAt", expression = "java(profile.getCreatedAt() != null ? profile.getCreatedAt().toString() : null)")
    @Mapping(target = "updatedAt", expression = "java(profile.getUpdatedAt() != null ? profile.getUpdatedAt().toString() : null)")
    PortfolioPublicResponse toPublicResponse(PortfolioProfile profile);

    @InheritConfiguration(name = "toPublicResponse")
    PortfolioAdminResponse toAdminResponse(PortfolioProfile profile);

    // ── Unified response (for both admin and public) ──────────────────────────

    @Mapping(source = "contactEmail",      target = "contact.email")
    @Mapping(source = "contactPhone",      target = "contact.phone")
    @Mapping(source = "contactPhones",     target = "contact.phones")
    @Mapping(source = "contactWhatsapp",   target = "contact.whatsapp")
    @Mapping(source = "contactTelegram",   target = "contact.telegram")
    @Mapping(source = "address",           target = "contact.address")
    @Mapping(source = "mapLink",           target = "contact.mapLink")
    @Mapping(source = "socialFacebook",    target = "socialMedia.facebook")
    @Mapping(source = "socialInstagram",   target = "socialMedia.instagram")
    @Mapping(source = "socialTwitter",     target = "socialMedia.twitter")
    @Mapping(source = "socialLinkedin",    target = "socialMedia.linkedin")
    @Mapping(source = "socialYoutube",     target = "socialMedia.youtube")
    @Mapping(source = "socialTiktok",      target = "socialMedia.tiktok")
    @Mapping(source = "socialWebsite",     target = "socialMedia.website")
    @Mapping(source = "yearsInBusiness",   target = "stats.yearsInBusiness")
    @Mapping(source = "customersServed",   target = "stats.customersServed")
    @Mapping(source = "customStats",       target = "stats.customStats",  qualifiedByName = "filterAndMapStatsUnified")
    @Mapping(source = "businessHours",     target = "businessHours",      qualifiedByName = "filterAndMapHoursUnified")
    @Mapping(source = "gallery",           target = "gallery",             qualifiedByName = "filterAndMapGalleryUnified")
    @Mapping(source = "services",          target = "services",            qualifiedByName = "filterAndMapServicesUnified")
    @Mapping(source = "team",              target = "team",                qualifiedByName = "filterAndMapTeamUnified")
    @Mapping(target = "reviewStats",       ignore = true)
    @Mapping(target = "createdAt", expression = "java(profile.getCreatedAt() != null ? profile.getCreatedAt().toString() : null)")
    @Mapping(target = "updatedAt", expression = "java(profile.getUpdatedAt() != null ? profile.getUpdatedAt().toString() : null)")
    PortfolioResponse toUnifiedResponse(PortfolioProfile profile);

    // ── Unified child DTOs ────────────────────────────────────────────────────

    PortfolioResponse.HoursDto toHoursDtoUnified(PortfolioHours hours);

    PortfolioResponse.GalleryItemDto toGalleryDtoUnified(PortfolioGalleryItem item);

    PortfolioResponse.ServiceItemDto toServiceDtoUnified(PortfolioServiceItem service);

    PortfolioResponse.TeamMemberDto toTeamDtoUnified(PortfolioTeamMember member);

    PortfolioResponse.CustomStatDto toCustomStatDtoUnified(PortfolioCustomStat stat);

    // ── Pagination ──────────────────────────────────────────────────────────

    default PaginationResponse<PortfolioReviewAdminResponse> toReviewPaginationResponse(
            Page<PortfolioReview> page, PaginationMapper paginationMapper) {
        return paginationMapper.toPaginationResponse(page, this::toReviewAdminResponseList);
    }
}
