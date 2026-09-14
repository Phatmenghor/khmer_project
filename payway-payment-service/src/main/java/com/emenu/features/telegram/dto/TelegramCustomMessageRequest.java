package com.emenu.features.telegram.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TelegramCustomMessageRequest {

    private String chatId;
    private String headerIcon;
    private String title;

    @NotBlank(message = "Message context/content is required")
    private String message;

    private Map<String, String> fields;
    private Map<String, String> codeFields;
    private String parseMode;
}
