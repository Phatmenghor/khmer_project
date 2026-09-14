package com.emenu.features.bakong.service;

import org.springframework.http.HttpMethod;

public interface BakongProxyService {

    <T> T proxyRequest(String path, HttpMethod method, Object requestBody, Class<T> responseType);
}
