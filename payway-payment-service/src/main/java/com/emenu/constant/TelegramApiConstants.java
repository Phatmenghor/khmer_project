package com.emenu.constant;

public final class TelegramApiConstants {

    private TelegramApiConstants() {}

    public static final String DEFAULT_TELEGRAM_API_URL = "https://api.telegram.org";
    public static final String SEND_MESSAGE_PATH = "/bot{token}/sendMessage";
    public static final String GET_CHAT_PATH = "/bot{token}/getChat";
}
