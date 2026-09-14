package com.emenu.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "telegram.bot")
public class TelegramProperties {
    private boolean enabled;
    private String token;
    private String groupChatId;
    private String webhookUrl;
    private boolean autoSetup;
    private String apiUrl;
    private String sendMessageUrl;
    private String getChatUrl;
}
