package com.emenu.config.spaces;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Configuration for the Spaces microservice proxy.
 *
 * <p>All requests from this project use a single configured API key
 * representing the project (e.g. emenu). Dynamic sub-routing paths
 * are passed as parameters on upload.</p>
 */
@Data
@Component
@ConfigurationProperties(prefix = "spaces")
public class SpacesProperties {
    private String serviceUrl;
    /** The single API key for the project registered in the Spaces service */
    private String apiKey;

    /** pathStore registered for {@link #apiKey} — needed to build the full path for the admin delete-all call. */
    private String pathStore;

    /** Basic Auth credentials for resource-storage-service's admin endpoints. */
    private String adminUsername;
    private String adminPassword;
}
