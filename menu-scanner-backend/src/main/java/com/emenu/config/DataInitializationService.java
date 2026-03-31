package com.emenu.config;

import com.emenu.enums.user.AccountStatus;
import com.emenu.enums.user.UserType;
import com.emenu.features.auth.models.Role;
import com.emenu.features.auth.models.User;
import com.emenu.features.auth.repository.RoleRepository;
import com.emenu.features.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.concurrent.atomic.AtomicBoolean;

@Service
@RequiredArgsConstructor
@Order(1)
public class DataInitializationService {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private static final AtomicBoolean initialized = new AtomicBoolean(false);
    private static final Object initLock = new Object();

    @Value("${app.init.create-admin:true}")
    private boolean createDefaultAdmin;

    @Value("${app.init.admin-email:phatmenghor19@gmail.com}")
    private String defaultAdminEmail;

    @Value("${app.init.admin-password:88889999}")
    private String defaultAdminPassword;

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void initializeData() {
        // ✅ ENHANCED: Double-checked locking pattern for thread safety
        if (initialized.get()) {
            return;
        }

        synchronized (initLock) {
            if (initialized.get()) {
                return;
            }

            try {

                // Initialize in strict order
                int rolesCreated = ensureRolesExist();


                if (createDefaultAdmin) {
                    int usersCreated = initializeDefaultUsers();
                }

                // Mark as initialized only after all steps complete
                initialized.set(true);

            } catch (Exception e) {
                // Don't set initialized flag on failure so it can be retried
                throw new RuntimeException("Data initialization failed", e);
            }
        }
    }

    private int ensureRolesExist() {
        try {

            // System roles with their user types
            record RoleConfig(String name, UserType userType) {}
            RoleConfig[] systemRoles = {
                    new RoleConfig("PLATFORM_OWNER", UserType.PLATFORM_USER),
                    new RoleConfig("BUSINESS_OWNER", UserType.BUSINESS_USER),
                    new RoleConfig("CUSTOMER", UserType.CUSTOMER)
            };
            int createdCount = 0;

            for (RoleConfig roleConfig : systemRoles) {
                if (!roleRepository.existsByNameAndIsDeletedFalse(roleConfig.name())) {
                    Role role = new Role();
                    role.setName(roleConfig.name());
                    role.setDescription("System role: " + roleConfig.name());
                    role.setBusinessId(null);
                    role.setUserType(roleConfig.userType());
                    roleRepository.save(role);
                    createdCount++;
                }
            }

            if (createdCount > 0) {
            } else {
            }

            return systemRoles.length;

        } catch (Exception e) {
            throw new RuntimeException("Failed to ensure roles exist", e);
        }
    }

    private int initializeDefaultUsers() {
        try {
            
            int usersCreated = 0;
            usersCreated += createPlatformOwner();
            
            return usersCreated;
            
        } catch (Exception e) {
            throw new RuntimeException("Failed to initialize default users", e);
        }
    }

    private int createPlatformOwner() {
        try {
            String adminUserIdentifier = defaultAdminEmail;

            if (!userRepository.existsByUserIdentifierAndIsDeletedFalse(adminUserIdentifier)) {
                User admin = new User();
                admin.setUserIdentifier(adminUserIdentifier);
                admin.setPassword(passwordEncoder.encode(defaultAdminPassword));
                admin.setUserType(UserType.PLATFORM_USER);
                admin.setAccountStatus(AccountStatus.ACTIVE);

                Role platformOwnerRole = roleRepository.findByNameAndIsDeletedFalse("PLATFORM_OWNER")
                        .orElseThrow(() -> new RuntimeException("Platform owner role not found"));
                admin.setRoles(List.of(platformOwnerRole));

                admin = userRepository.save(admin);

                com.emenu.features.auth.models.UserProfile profile = new com.emenu.features.auth.models.UserProfile();
                profile.setUser(admin);
                profile.setEmail(defaultAdminEmail);
                profile.setFirstName("Platform");
                profile.setLastName("Administrator");
                admin.setProfile(profile);

                com.emenu.features.auth.models.UserEmployment employment = new com.emenu.features.auth.models.UserEmployment();
                employment.setUser(admin);
                employment.setPosition("Platform Owner");
                admin.setEmployment(employment);

                admin = userRepository.save(admin);
                return 1;
            } else {
                return 0;
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to create platform owner", e);
        }
    }
}