package com.emenu.features.spaces.util;

import com.emenu.features.spaces.enums.EntityType;
import com.emenu.features.spaces.enums.ImageVariant;

import java.util.UUID;

public final class StorageKeyUtil {

    private StorageKeyUtil() {}

    // b/{businessId}/p/{productId}/{variant}.webp
    public static String productKey(UUID businessId, String productId, ImageVariant variant) {
        return "b/" + businessId + "/p/" + productId + "/" + variant.getCode() + ".webp";
    }

    // b/{businessId}/c/{categoryId}/sm.webp
    public static String categoryKey(UUID businessId, String categoryId) {
        return "b/" + businessId + "/c/" + categoryId + "/sm.webp";
    }

    // b/{businessId}/logo/logo.webp
    public static String logoKey(UUID businessId) {
        return "b/" + businessId + "/logo/logo.webp";
    }

    // b/{businessId}/banner/banner.webp
    public static String bannerKey(UUID businessId) {
        return "b/" + businessId + "/banner/banner.webp";
    }

    // b/{businessId}/qr/table-{tableId}.webp
    public static String qrKey(UUID businessId, String tableId) {
        return "b/" + businessId + "/qr/table-" + tableId + ".webp";
    }

    // b/{businessId}/ — used for bulk business delete
    public static String businessPrefix(UUID businessId) {
        return "b/" + businessId + "/";
    }

    // Entity-level prefix or exact key (for QR) used for entity delete
    public static String entityPrefix(UUID businessId, EntityType entityType, String entityId) {
        return switch (entityType) {
            case PRODUCT  -> "b/" + businessId + "/p/" + entityId + "/";
            case CATEGORY -> "b/" + businessId + "/c/" + entityId + "/";
            case LOGO     -> "b/" + businessId + "/logo/";
            case BANNER   -> "b/" + businessId + "/banner/";
            case QR       -> "b/" + businessId + "/qr/table-" + entityId + ".webp";
        };
    }

    // Build upload key from entityType + entityId + variant
    public static String buildKey(UUID businessId, EntityType entityType, String entityId, ImageVariant variant) {
        return switch (entityType) {
            case PRODUCT  -> productKey(businessId, entityId, variant);
            case CATEGORY -> categoryKey(businessId, entityId);
            case LOGO     -> logoKey(businessId);
            case BANNER   -> bannerKey(businessId);
            case QR       -> qrKey(businessId, entityId);
        };
    }
}
