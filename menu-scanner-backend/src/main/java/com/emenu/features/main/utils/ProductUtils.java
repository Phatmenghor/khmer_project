package com.emenu.features.main.utils;

import org.springframework.stereotype.Component;

@Component
public class ProductUtils {

    public boolean isValidImageUrl(String imageUrl) {
        if (imageUrl == null || imageUrl.trim().isEmpty()) {
            return false;
        }

        String url = imageUrl.toLowerCase();
        return url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/");
    }
}