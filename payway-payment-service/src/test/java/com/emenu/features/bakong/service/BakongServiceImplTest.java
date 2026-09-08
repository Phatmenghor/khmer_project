package com.emenu.features.bakong.service;

import com.emenu.features.bakong.common.BakongReactiveExecutor;
import com.emenu.features.bakong.common.TelegramNotifier;
import com.emenu.features.bakong.config.BakongProperties;
import com.emenu.features.bakong.dto.BakongQrResponse;
import com.emenu.features.bakong.dto.BakongRequest;
import com.emenu.features.bakong.dto.CheckTransactionRequest;
import com.emenu.features.bakong.mapper.MerchantInfoMapperImpl;
import com.emenu.features.bakong.model.BakongTransaction;
import com.emenu.features.bakong.repository.BakongTransactionRepository;
import com.emenu.features.bakong.service.impl.BakongServiceImpl;
import com.fasterxml.jackson.databind.ObjectMapper;
import kh.gov.nbc.bakong_khqr.model.KHQRCurrency;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.concurrent.Executors;

import static org.junit.jupiter.api.Assertions.*;

public class BakongServiceImplTest {

    private BakongServiceImpl bakongService;
    private BakongTransactionRepository transactionRepository;

    @BeforeEach
    void setUp() {
        BakongProperties properties = new BakongProperties();
        properties.setAccountId("phat_menghor@bkrt");
        properties.setApiUrl("https://api-bakong.nbc.gov.kh");

        transactionRepository = Mockito.mock(BakongTransactionRepository.class);
        BakongTokenService tokenService = Mockito.mock(BakongTokenService.class);
        TelegramNotifier telegramNotifier = Mockito.mock(TelegramNotifier.class);
        BakongReactiveExecutor reactiveExecutor = new BakongReactiveExecutor();

        bakongService = new BakongServiceImpl(
                RestClient.create(),
                new ObjectMapper(),
                properties,
                tokenService,
                new MerchantInfoMapperImpl(),
                null,
                telegramNotifier,
                reactiveExecutor,
                transactionRepository
        );
    }

    @Test
    void testGenerateQR_Success() {
        BakongRequest request = BakongRequest.builder()
                .currency(KHQRCurrency.USD)
                .amount(5.0)
                .merchantName("eMenu Coffee & Bakery")
                .expirationMinutes(15)
                .build();

        BakongQrResponse response = bakongService.generateQR(request, "http://localhost:7073/api/v1/bakong/generate-qr")
                .block();

        assertNotNull(response);
        assertNotNull(response.getQr(), "Generated QR string must not be null");
        assertNotNull(response.getMd5(), "Generated MD5 must not be null");
        assertEquals(32, response.getMd5().length(), "MD5 hash must be 32 characters");
        assertTrue(response.getQr().startsWith("000201"), "KHQR payload must start with EMVCo 000201 header");
    }

    @Test
    void testGetQRImage_Success() {
        String testMd5 = "26135453147a814980c04ce1a1b18718";
        String testQr = "00020101021238540016phat_menghor@bkrt52045999530384054045.005802KH5921eMenu Coffee & Bakery6010Phnom Penh6304ABCD";

        BakongTransaction mockTx = BakongTransaction.builder()
                .md5(testMd5)
                .merchantName("eMenu Coffee & Bakery")
                .amount(BigDecimal.valueOf(5.0))
                .currency("USD")
                .rawQrString(testQr)
                .build();

        Mockito.when(transactionRepository.findByMd5(testMd5)).thenReturn(Optional.of(mockTx));

        CheckTransactionRequest request = new CheckTransactionRequest(testMd5);
        byte[] imageBytes = bakongService.getQRImage(request, "http://localhost:7073/api/v1/bakong/get-qr-image")
                .block();

        assertNotNull(imageBytes);
        assertTrue(imageBytes.length > 1000, "Rendered PNG byte stream must contain image data");
    }
}
