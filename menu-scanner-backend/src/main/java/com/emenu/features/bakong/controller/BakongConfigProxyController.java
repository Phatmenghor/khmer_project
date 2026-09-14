package com.emenu.features.bakong.controller;

import com.emenu.features.bakong.service.BakongProxyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/bakong-configs")
@RequiredArgsConstructor
public class BakongConfigProxyController {

    private final BakongProxyService proxyService;

    @PostMapping("/get-all")
    public ResponseEntity<Object> getConfigsByBody(@RequestBody(required = false) Object body) {
        return ResponseEntity.ok(proxyService.proxyRequest("/api/v1/bakong-configs/get-all", HttpMethod.POST, body, Object.class));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> getConfigDetail(@PathVariable UUID id) {
        return ResponseEntity.ok(proxyService.proxyRequest("/api/v1/bakong-configs/" + id, HttpMethod.GET, null, Object.class));
    }

    @PostMapping
    public ResponseEntity<Object> createConfig(@RequestBody Object body) {
        return ResponseEntity.ok(proxyService.proxyRequest("/api/v1/bakong-configs", HttpMethod.POST, body, Object.class));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Object> updateConfig(@PathVariable UUID id, @RequestBody Object body) {
        return ResponseEntity.ok(proxyService.proxyRequest("/api/v1/bakong-configs/" + id, HttpMethod.PUT, body, Object.class));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Object> deleteConfig(@PathVariable UUID id) {
        return ResponseEntity.ok(proxyService.proxyRequest("/api/v1/bakong-configs/" + id, HttpMethod.DELETE, null, Object.class));
    }
}
