package com.emenu.features.spaces.util;

import java.util.UUID;

public final class StorageKeyUtil {

    private StorageKeyUtil() {}

    // ── Product ───────────────────────────────────────────────────────────────
    // b/{businessId}/p/{productId}/{variant}.webp   variant: sm | md | lg | o
    public static String product(UUID businessId, String productId, String variant) {
        return "b/" + businessId + "/p/" + productId + "/" + variant + ".webp";
    }

    // Prefix covering all variants of one product: b/{businessId}/p/{productId}/
    public static String productPrefix(UUID businessId, String productId) {
        return "b/" + businessId + "/p/" + productId + "/";
    }

    // ── Category ──────────────────────────────────────────────────────────────
    // b/{businessId}/c/{categoryId}/sm.webp
    public static String category(UUID businessId, String categoryId) {
        return "b/" + businessId + "/c/" + categoryId + "/sm.webp";
    }

    // Prefix: b/{businessId}/c/{categoryId}/
    public static String categoryPrefix(UUID businessId, String categoryId) {
        return "b/" + businessId + "/c/" + categoryId + "/";
    }

    // ── Logo ──────────────────────────────────────────────────────────────────
    // b/{businessId}/logo/logo.webp
    public static String logo(UUID businessId) {
        return "b/" + businessId + "/logo/logo.webp";
    }

    // Prefix: b/{businessId}/logo/
    public static String logoPrefix(UUID businessId) {
        return "b/" + businessId + "/logo/";
    }

    // ── Banner ────────────────────────────────────────────────────────────────
    // b/{businessId}/banner/banner.webp
    public static String banner(UUID businessId) {
        return "b/" + businessId + "/banner/banner.webp";
    }

    // Prefix: b/{businessId}/banner/
    public static String bannerPrefix(UUID businessId) {
        return "b/" + businessId + "/banner/";
    }

    // ── QR ───────────────────────────────────────────────────────────────────
    // b/{businessId}/qr/table-{tableId}.webp
    public static String qr(UUID businessId, String tableId) {
        return "b/" + businessId + "/qr/table-" + tableId + ".webp";
    }

    // ── Business (bulk) ───────────────────────────────────────────────────────
    // b/{businessId}/  — used for subscription expiry / business deletion
    public static String businessPrefix(UUID businessId) {
        return "b/" + businessId + "/";
    }
}
