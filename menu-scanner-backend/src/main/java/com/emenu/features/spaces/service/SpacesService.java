package com.emenu.features.spaces.service;

import com.emenu.features.spaces.dto.response.SpacesImageResponse;
import com.emenu.features.spaces.dto.response.SpacesMultiUploadResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Proxy interface for the Spaces microservice.
 *
 * <p>Each caller uses a dedicated API key that already encodes
 * its own project code and path — callers do NOT pass businessId or
 * project-code separately. The API key on the request carries all context.</p>
 *
 * <ul>
 *   <li>{@code uploadForBusiness(file)} — uploads using the business-scoped API key.</li>
 *   <li>{@code uploadForOwner(file)}    — uploads using the owner-scoped API key.</li>
 *   <li>{@code uploadForCustomer(file)} — uploads using the customer-scoped API key.</li>
 * </ul>
 */
public interface SpacesService {

    /** Upload image using a dynamic path. */
    SpacesMultiUploadResponse upload(MultipartFile file, String path);

    /** Upload image for a business. Legacy method, delegates to upload(file, "business"). */
    SpacesMultiUploadResponse uploadForBusiness(MultipartFile file);

    /** Upload image for owner. Legacy method, delegates to upload(file, "owner"). */
    SpacesMultiUploadResponse uploadForOwner(MultipartFile file);

    /** Upload image for customer. Legacy method, delegates to upload(file, "customer"). */
    SpacesMultiUploadResponse uploadForCustomer(MultipartFile file);

    /** Delete a single object by its full storage key. */
    void deleteByKey(String key);

    /** Delete all objects under a specific date prefix and path. */
    void deleteByDate(String datePrefix, String path);

    /** Legacy deleteByDate (defaults to "business"). */
    void deleteByDate(String datePrefix);

    /** Delete ALL objects for a path. */
    void deleteAll(String path);

    /** Legacy deleteAll (defaults to "business"). */
    void deleteAll();

    /** Return all image log entries for a specific path. */
    List<SpacesImageResponse> getLogs(String path);

    /** Legacy getLogs (defaults to "business"). */
    List<SpacesImageResponse> getLogs();
}
