package com.emenu.constant;

public final class ApiEndpoints {

    private ApiEndpoints() {}

    public static final String API_V1_PREFIX = "/api/v1";

    // ── Bakong Endpoints ──
    public static final String BAKONG_BASE = API_V1_PREFIX + "/bakong";
    public static final String BAKONG_GENERATE_QR = "/generate-qr";
    public static final String BAKONG_GET_QR_IMAGE = "/get-qr-image";
    public static final String BAKONG_CHECK_TRANSACTION = "/check-transaction";
    public static final String BAKONG_CHECK_TRANSACTION_BY_HASH = "/check-transaction-by-hash";
    public static final String BAKONG_CHECK_ACCOUNT = "/check-account";
    public static final String BAKONG_CHECK_TRANSACTION_BY_MD5_LIST = "/check-transaction-by-md5-list";
    public static final String BAKONG_STREAM_CHECK_TRANSACTION = "/check-transaction/stream";
    public static final String BAKONG_STATUS = "/status";

    // ── Telegram Endpoints ──
    public static final String TELEGRAM_BASE = API_V1_PREFIX + "/telegram";
    public static final String TELEGRAM_SEND = "/send";

    // ── API Key Admin Endpoints ──
    public static final String ADMIN_KEYS_BASE = API_V1_PREFIX + "/admin/keys";
    public static final String ADMIN_KEYS_BY_ID = "/{id}";
}
