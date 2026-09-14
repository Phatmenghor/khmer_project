package com.emenu.constant;

public final class BakongApiConstants {

    private BakongApiConstants() {}

    public static final String DEFAULT_BAKONG_API_URL = "https://api-bakong.nbc.gov.kh";
    public static final String DEFAULT_DEVELOPER_ACCOUNT_ID = "phat_menghor@bkrt";
    public static final String DEFAULT_DEVELOPER_EMAIL = "phatmenghor7@gmail.com";
    public static final int DEFAULT_DAILY_RATE_LIMIT = 100;

    // ── Bakong Upstream NBC Open API Endpoints ──
    public static final String RENEW_TOKEN_ENDPOINT = "/v1/renew_token";
    public static final String CHECK_TRANSACTION_BY_MD5_ENDPOINT = "/v1/check_transaction_by_md5";
    public static final String CHECK_TRANSACTION_BY_HASH_ENDPOINT = "/v1/check_transaction_by_hash";
    public static final String CHECK_BAKONG_ACCOUNT_ENDPOINT = "/v1/check_bakong_account";
    public static final String CHECK_TRANSACTION_BY_MD5_LIST_ENDPOINT = "/v1/check_transaction_by_md5_list";
}
