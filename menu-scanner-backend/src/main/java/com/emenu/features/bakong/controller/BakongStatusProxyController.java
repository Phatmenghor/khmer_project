package com.emenu.features.bakong.controller;

import com.emenu.features.bakong.service.BakongProxyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/bakong")
@RequiredArgsConstructor
public class BakongStatusProxyController {

    private final BakongProxyService proxyService;

    @GetMapping("/status")
    public ResponseEntity<Object> getMonitoringStatus() {
        return ResponseEntity.ok(proxyService.proxyRequest("/api/v1/bakong/status", HttpMethod.GET, null, Object.class));
    }
}
