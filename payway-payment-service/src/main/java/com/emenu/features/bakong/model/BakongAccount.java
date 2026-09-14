package com.emenu.features.bakong.model;

import com.emenu.shared.domain.BaseUUIDEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "bakong_accounts")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class BakongAccount extends BaseUUIDEntity {

    @Column(name = "account_id", nullable = false, unique = true, length = 100)
    private String accountId;

    @Column(name = "merchant_name", nullable = false, length = 150)
    private String merchantName;

    @Column(name = "merchant_city", length = 100)
    private String merchantCity;

    @Column(name = "acquiring_bank", length = 100)
    private String acquiringBank;

    @Column(name = "currency", length = 10)
    private String currency;

    @Column(name = "is_default", nullable = false)
    private boolean isDefault;

    @Column(name = "enabled", nullable = false)
    private boolean enabled;
}
