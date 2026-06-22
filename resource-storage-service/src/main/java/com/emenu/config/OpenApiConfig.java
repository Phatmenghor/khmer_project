package com.emenu.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition
@SecurityScheme(
        name = OpenApiConfig.API_KEY_SCHEME,
        type = SecuritySchemeType.APIKEY,
        in = io.swagger.v3.oas.annotations.enums.SecuritySchemeIn.HEADER,
        paramName = "X-API-Key"
)
@SecurityScheme(
        name = OpenApiConfig.BASIC_AUTH_SCHEME,
        type = SecuritySchemeType.HTTP,
        scheme = "basic"
)
public class OpenApiConfig {

    public static final String API_KEY_SCHEME = "ApiKeyAuth";
    public static final String BASIC_AUTH_SCHEME = "BasicAuth";
}
