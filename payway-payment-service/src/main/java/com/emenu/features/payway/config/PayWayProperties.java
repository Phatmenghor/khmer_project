package com.emenu.features.payway.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "payway")
public class PayWayProperties {

    private String merchantId = "ec477511";
    private String apiKey = "d2b3cc6044e4785508e4e78d4dfdc85b3d58a656";
    private String apiUrl = "https://checkout-sandbox.payway.com.kh";
    private String purchaseUrl = "https://checkout-sandbox.payway.com.kh/api/payment-gateway/v1/payments/purchase";
    private String checkTransactionUrl = "https://checkout-sandbox.payway.com.kh/api/payment-gateway/v1/payments/check-transaction";
    private String rsaPublicKey = "-----BEGIN PUBLIC KEY-----\nMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCm0RzZxzff66mr9eVA7KT44+PvnBYau1ym+BJ/DvEmDxiqoPcMna20BrqkGo3/BYjCG6E1q9ZATj8Ru5+jhqbVE65jMKeVnjW8d4VhkH74FQs77dIaUiMJiWnxJ0Rpe1mLgHY/bYpenVsSnFqkZPzWCu+63RdgzzHsMhmVFGMaZQIDAQAB\n-----END PUBLIC KEY-----";
    private String rsaPrivateKey = "-----BEGIN RSA PRIVATE KEY-----\nMIICXAIBAAKBgQCvTVYJ2oqLnzHD3O5dPxfhQ9bKIR0c/WIOAb1l35lXRgwhsk9SlILn5jxyBtfaiycyNnyUqP8zDGXUEENetw1joRQLqzXEn1/noTzHsI9ltKMY8i6dZmTCimcGOcN7AobYN/V48r0fp/6tKvSebFGLNCY3VRWouvbuAOegJIQHLQIDAQABAoGACaTqDlm5FIxaCwn9DSE6+ZgnWXBv7xfbjKS43EFsaLpAUZxDM+pat1JZ0fYhavML4X3Q5cbUX2UXtw57/lp4wIKS3Zv2iZvIprxtb/alMf9mlpb3H3CRCx88vAzoTY4NhNAoTt+YveXLSvaMDdgEyICyqKm0ycGfiMdqy90nWQECQQDHmoRWOf2TQgJKsD/5Sp02DWEn5oGdv5XZfLbjb5qnLqeNqu0sxQzPKQdtkao9sRoUFthIQK4O8UOYH+QgZxCBAkEA4NUS1CyfTG09T0gFNQngWDOp+fHh8E0nRmLRA3FGL1FP9wA9UnmeSyu4SGiSH1EPNsT4bObo9o3kI0x9Se3grQJBAL1dM1WWmKJ/CkQ6DcdU6UchdF3lSmy9GM4Hin7FH6SiF2XIllBV9WwH0bs6aZczkLkkXzZU3ozgiS8mekffX4ECQBKg1NyLje9RJcFJ4FSSqunj7fNtnSDB470rNtIoMn59KDj45hvNQ9ZKmww0zdaWasJI86RiRW8YNozOK5tSgEkCQDHOqkk+a7+AoEZtt0VfpwHq7cbdgQWmbznzq4x9fodY0vpDDCh4wCuf9v6e9IVXW8qSNRhsqlWEs22Jh2ZOBJg=\n-----END RSA PRIVATE KEY-----";
    private boolean enabled = true;
}
