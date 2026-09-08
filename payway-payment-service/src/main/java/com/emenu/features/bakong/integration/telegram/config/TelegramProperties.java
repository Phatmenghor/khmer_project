package com.emenu.features.bakong.integration.telegram.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "telegram.bot")
public class TelegramProperties {
    private boolean enabled = true;
    private String token;
    private String groupChatId;
    private String webhookUrl;
    private boolean autoSetup = true;
    private String apiUrl = "https://api.telegram.org";
    private String sendMessageUrl = "https://api.telegram.org/bot{token}/sendMessage";
    private String getChatUrl = "https://api.telegram.org/bot{token}/getChat?chat_id={chatId}";
}
