package com.emenu.features.bakong.controller;

import com.emenu.features.bakong.service.BakongProxyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/bakong-transactions")
@RequiredArgsConstructor
public class BakongTransactionProxyController {

    private final BakongProxyService proxyService;

    @PostMapping("/get-all")
    public ResponseEntity<Object> searchTransactionsByBody(@RequestBody(required = false) Object body) {
        return ResponseEntity.ok(proxyService.proxyRequest("/api/v1/bakong-transactions/get-all", HttpMethod.POST, body, Object.class));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> getTransactionDetail(@PathVariable UUID id) {
        return ResponseEntity.ok(proxyService.proxyRequest("/api/v1/bakong-transactions/" + id, HttpMethod.GET, null, Object.class));
    }

    @PostMapping("/verify")
    public ResponseEntity<Object> verifyTransaction(@RequestBody Object body) {
        return ResponseEntity.ok(proxyService.proxyRequest("/api/v1/bakong-transactions/verify", HttpMethod.POST, body, Object.class));
    }
}
