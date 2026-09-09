package com.emenu.features.payway.util;

import lombok.extern.slf4j.Slf4j;

import javax.crypto.Cipher;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

@Slf4j
public class PayWayCryptoUtils {

    private static final String HMAC_SHA512_ALGORITHM = "HmacSHA512";
    private static final String RSA_ALGORITHM = "RSA";
    private static final String RSA_TRANSFORMATION = "RSA/ECB/PKCS1Padding";

    /**
     * Calculate ABA PayWay HMAC-SHA512 Hash for Checkout / Purchase request.
     */
    public static String getHash(
            String reqTime,
            String merchantId,
            String tranId,
            String amount,
            String items,
            String shipping,
            String firstname,
            String lastname,
            String email,
            String phone,
            String type,
            String paymentOption,
            String continueSuccessUrl,
            String returnUrl,
            String cancelUrl,
            String currency,
            String returnParams,
            String apiKey) {

        String rawData = nullToEmpty(reqTime)
                + nullToEmpty(merchantId)
                + nullToEmpty(tranId)
                + nullToEmpty(amount)
                + nullToEmpty(items)
                + nullToEmpty(shipping)
                + nullToEmpty(firstname)
                + nullToEmpty(lastname)
                + nullToEmpty(email)
                + nullToEmpty(phone)
                + nullToEmpty(type)
                + nullToEmpty(paymentOption)
                + nullToEmpty(continueSuccessUrl)
                + nullToEmpty(returnUrl)
                + nullToEmpty(cancelUrl)
                + nullToEmpty(currency)
                + nullToEmpty(returnParams);

        return hmacSha512Base64(rawData, apiKey);
    }

    /**
     * Calculate ABA PayWay HMAC-SHA512 Hash for Check Transaction request.
     */
    public static String getCheckTransactionHash(String reqTime, String merchantId, String tranId, String apiKey) {
        String rawData = nullToEmpty(reqTime) + nullToEmpty(merchantId) + nullToEmpty(tranId);
        return hmacSha512Base64(rawData, apiKey);
    }

    /**
     * Perform HMAC-SHA512 hashing and Base64 encode the result.
     */
    public static String hmacSha512Base64(String data, String key) {
        try {
            SecretKeySpec secretKeySpec = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), HMAC_SHA512_ALGORITHM);
            Mac mac = Mac.getInstance(HMAC_SHA512_ALGORITHM);
            mac.init(secretKeySpec);
            byte[] hmacBytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hmacBytes);
        } catch (Exception e) {
            log.error("Failed to generate HMAC-SHA512 hash for PayWay: {}", e.getMessage(), e);
            throw new RuntimeException("PayWay Hash Generation Error: " + e.getMessage(), e);
        }
    }

    /**
     * Encrypt plaintext string using RSA Public Key (Base64 output).
     */
    public static String rsaEncrypt(String plainText, String pemPublicKey) {
        try {
            PublicKey publicKey = getPublicKeyFromPem(pemPublicKey);
            Cipher cipher = Cipher.getInstance(RSA_TRANSFORMATION);
            cipher.init(Cipher.ENCRYPT_MODE, publicKey);
            byte[] encryptedBytes = cipher.doFinal(plainText.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(encryptedBytes);
        } catch (Exception e) {
            log.error("RSA Encryption failed: {}", e.getMessage(), e);
            throw new RuntimeException("RSA Encryption error: " + e.getMessage(), e);
        }
    }

    /**
     * Decrypt Base64 encrypted text using RSA Private Key.
     */
    public static String rsaDecrypt(String base64EncryptedText, String pemPrivateKey) {
        try {
            PrivateKey privateKey = getPrivateKeyFromPem(pemPrivateKey);
            Cipher cipher = Cipher.getInstance(RSA_TRANSFORMATION);
            cipher.init(Cipher.DECRYPT_MODE, privateKey);
            byte[] decryptedBytes = cipher.doFinal(Base64.getDecoder().decode(base64EncryptedText));
            return new String(decryptedBytes, StandardCharsets.UTF_8);
        } catch (Exception e) {
            log.error("RSA Decryption failed: {}", e.getMessage(), e);
            throw new RuntimeException("RSA Decryption error: " + e.getMessage(), e);
        }
    }

    private static PublicKey getPublicKeyFromPem(String pem) throws Exception {
        String cleanPem = pem.replace("-----BEGIN PUBLIC KEY-----", "")
                .replace("-----END PUBLIC KEY-----", "")
                .replaceAll("\\s+", "");
        byte[] keyBytes = Base64.getDecoder().decode(cleanPem);
        X509EncodedKeySpec spec = new X509EncodedKeySpec(keyBytes);
        KeyFactory kf = KeyFactory.getInstance(RSA_ALGORITHM);
        return kf.generatePublic(spec);
    }

    private static PrivateKey getPrivateKeyFromPem(String pem) throws Exception {
        boolean isPkcs1 = pem.contains("BEGIN RSA PRIVATE KEY");
        String cleanPem = pem.replace("-----BEGIN RSA PRIVATE KEY-----", "")
                .replace("-----END RSA PRIVATE KEY-----", "")
                .replace("-----BEGIN PRIVATE KEY-----", "")
                .replace("-----END PRIVATE KEY-----", "")
                .replaceAll("\\s+", "");
        byte[] keyBytes = Base64.getDecoder().decode(cleanPem);

        if (isPkcs1) {
            keyBytes = convertPkcs1ToPkcs8(keyBytes);
        }

        PKCS8EncodedKeySpec spec = new PKCS8EncodedKeySpec(keyBytes);
        KeyFactory kf = KeyFactory.getInstance(RSA_ALGORITHM);
        return kf.generatePrivate(spec);
    }

    private static byte[] convertPkcs1ToPkcs8(byte[] pkcs1Bytes) {
        int pkcs1Length = pkcs1Bytes.length;
        int totalLength = pkcs1Length + 22;
        byte[] pkcs8Header;
        if (totalLength < 128) {
            pkcs8Header = new byte[] {
                    0x30, (byte) totalLength,
                    0x02, 0x01, 0x00,
                    0x30, 0x0d, 0x06, 0x09, 0x2a, (byte) 0x86, 0x48, (byte) 0x86, (byte) 0xf7, 0x0d, 0x01, 0x01, 0x01, 0x05, 0x00,
                    0x04, (byte) pkcs1Length
            };
        } else if (totalLength <= 255) {
            pkcs8Header = new byte[] {
                    0x30, (byte) 0x81, (byte) totalLength,
                    0x02, 0x01, 0x00,
                    0x30, 0x0d, 0x06, 0x09, 0x2a, (byte) 0x86, 0x48, (byte) 0x86, (byte) 0xf7, 0x0d, 0x01, 0x01, 0x01, 0x05, 0x00,
                    0x04, (byte) 0x81, (byte) pkcs1Length
            };
        } else {
            pkcs8Header = new byte[] {
                    0x30, (byte) 0x82, (byte) ((totalLength >> 8) & 0xff), (byte) (totalLength & 0xff),
                    0x02, 0x01, 0x00,
                    0x30, 0x0d, 0x06, 0x09, 0x2a, (byte) 0x86, 0x48, (byte) 0x86, (byte) 0xf7, 0x0d, 0x01, 0x01, 0x01, 0x05, 0x00,
                    0x04, (byte) 0x82, (byte) ((pkcs1Length >> 8) & 0xff), (byte) (pkcs1Length & 0xff)
            };
        }
        byte[] pkcs8Bytes = new byte[pkcs8Header.length + pkcs1Bytes.length];
        System.arraycopy(pkcs8Header, 0, pkcs8Bytes, 0, pkcs8Header.length);
        System.arraycopy(pkcs1Bytes, 0, pkcs8Bytes, pkcs8Header.length, pkcs1Bytes.length);
        return pkcs8Bytes;
    }

    private static String nullToEmpty(String val) {
        return val == null ? "" : val.trim();
    }
}
