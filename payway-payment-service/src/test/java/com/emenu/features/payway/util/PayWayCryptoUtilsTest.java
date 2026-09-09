package com.emenu.features.payway.util;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.util.Base64;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class PayWayCryptoUtilsTest {

    private static final String API_KEY = "d2b3cc6044e4785508e4e78d4dfdc85b3d58a656";
    private static final String RSA_PUBLIC_KEY = "-----BEGIN PUBLIC KEY-----\nMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCm0RzZxzff66mr9eVA7KT44+PvnBYau1ym+BJ/DvEmDxiqoPcMna20BrqkGo3/BYjCG6E1q9ZATj8Ru5+jhqbVE65jMKeVnjW8d4VhkH74FQs77dIaUiMJiWnxJ0Rpe1mLgHY/bYpenVsSnFqkZPzWCu+63RdgzzHsMhmVFGMaZQIDAQAB\n-----END PUBLIC KEY-----";
    private static final String RSA_PRIVATE_KEY = "-----BEGIN RSA PRIVATE KEY-----\nMIICXAIBAAKBgQCvTVYJ2oqLnzHD3O5dPxfhQ9bKIR0c/WIOAb1l35lXRgwhsk9SlILn5jxyBtfaiycyNnyUqP8zDGXUEENetw1joRQLqzXEn1/noTzHsI9ltKMY8i6dZmTCimcGOcN7AobYN/V48r0fp/6tKvSebFGLNCY3VRWouvbuAOegJIQHLQIDAQABAoGACaTqDlm5FIxaCwn9DSE6+ZgnWXBv7xfbjKS43EFsaLpAUZxDM+pat1JZ0fYhavML4X3Q5cbUX2UXtw57/lp4wIKS3Zv2iZvIprxtb/alMf9mlpb3H3CRCx88vAzoTY4NhNAoTt+YveXLSvaMDdgEyICyqKm0ycGfiMdqy90nWQECQQDHmoRWOf2TQgJKsD/5Sp02DWEn5oGdv5XZfLbjb5qnLqeNqu0sxQzPKQdtkao9sRoUFthIQK4O8UOYH+QgZxCBAkEA4NUS1CyfTG09T0gFNQngWDOp+fHh8E0nRmLRA3FGL1FP9wA9UnmeSyu4SGiSH1EPNsT4bObo9o3kI0x9Se3grQJBAL1dM1WWmKJ/CkQ6DcdU6UchdF3lSmy9GM4Hin7FH6SiF2XIllBV9WwH0bs6aZczkLkkXzZU3ozgiS8mekffX4ECQBKg1NyLje9RJcFJ4FSSqunj7fNtnSDB470rNtIoMn59KDj45hvNQ9ZKmww0zdaWasJI86RiRW8YNozOK5tSgEkCQDHOqkk+a7+AoEZtt0VfpwHq7cbdgQWmbznzq4x9fodY0vpDDCh4wCuf9v6e9IVXW8qSNRhsqlWEs22Jh2ZOBJg=\n-----END RSA PRIVATE KEY-----";

    @Test
    @DisplayName("Should generate valid Base64 HMAC-SHA512 checkout hash")
    void testGetHash() {
        String hash = PayWayCryptoUtils.getHash(
                "20260909100000",
                "ec477511",
                "TX123456",
                "10.00",
                "",
                "",
                "John",
                "Doe",
                "john@example.com",
                "012345678",
                "purchase",
                "abapay",
                "https://example.com/success",
                "https://example.com/return",
                "",
                "USD",
                "",
                API_KEY
        );

        assertNotNull(hash);
        assertTrue(hash.length() > 20);
    }

    @Test
    @DisplayName("Should generate valid Base64 HMAC-SHA512 check-transaction hash")
    void testGetCheckTransactionHash() {
        String hash = PayWayCryptoUtils.getCheckTransactionHash("20260909100000", "ec477511", "TX123456", API_KEY);
        assertNotNull(hash);
        assertTrue(hash.length() > 20);
    }

    @Test
    @DisplayName("Should encrypt using provided RSA public key")
    void testRsaEncryptWithProvidedPublicKey() {
        String plainText = "TestPayload";
        String encrypted = PayWayCryptoUtils.rsaEncrypt(plainText, RSA_PUBLIC_KEY);
        assertNotNull(encrypted);
        assertTrue(encrypted.length() > 10);
    }

    @Test
    @DisplayName("Should encrypt and decrypt using matching RSA keypair")
    void testRsaEncryptDecryptMatchingPair() throws Exception {
        KeyPairGenerator keyGen = KeyPairGenerator.getInstance("RSA");
        keyGen.initialize(1024);
        KeyPair pair = keyGen.generateKeyPair();

        String pubPem = "-----BEGIN PUBLIC KEY-----\n" +
                Base64.getEncoder().encodeToString(pair.getPublic().getEncoded()) +
                "\n-----END PUBLIC KEY-----";

        String privPem = "-----BEGIN PRIVATE KEY-----\n" +
                Base64.getEncoder().encodeToString(pair.getPrivate().getEncoded()) +
                "\n-----END PRIVATE KEY-----";

        String plainText = "SecretTransactionData123";
        String encrypted = PayWayCryptoUtils.rsaEncrypt(plainText, pubPem);
        assertNotNull(encrypted);

        String decrypted = PayWayCryptoUtils.rsaDecrypt(encrypted, privPem);
        assertEquals(plainText, decrypted);
    }
}
