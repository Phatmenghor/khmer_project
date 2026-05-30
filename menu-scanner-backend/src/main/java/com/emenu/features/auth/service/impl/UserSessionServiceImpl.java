package com.emenu.features.auth.service.impl;

import com.emenu.exception.custom.ResourceNotFoundException;
import com.emenu.features.auth.dto.filter.SessionFilterRequest;
import com.emenu.features.auth.dto.helper.UserSessionCreateHelper;
import com.emenu.features.auth.dto.response.AdminSessionResponse;
import com.emenu.features.auth.dto.response.UserSessionResponse;
import com.emenu.features.auth.mapper.UserSessionMapper;
import com.emenu.features.auth.models.RefreshToken;
import com.emenu.features.auth.models.User;
import com.emenu.features.auth.models.UserSession;
import com.emenu.features.auth.repository.UserRepository;
import com.emenu.features.auth.repository.UserSessionRepository;
import com.emenu.features.auth.service.UserSessionService;
import com.emenu.features.auth.specification.UserSessionSpecification;
import com.emenu.shared.constants.SecurityConstants;
import com.emenu.shared.dto.PaginationResponse;
import com.emenu.shared.pagination.PaginationUtils;
import com.emenu.shared.utils.ClientIpUtils;
import com.emenu.shared.utils.FilterUtils;
import com.emenu.shared.utils.IpGeolocationService;
import com.emenu.shared.utils.UserAgentParser;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserSessionServiceImpl implements UserSessionService {

    private final UserSessionRepository sessionRepository;
    private final UserRepository userRepository;
    private final UserSessionMapper sessionMapper;
    private final IpGeolocationService geolocationService;

    @Override
    @Transactional
    public UserSessionResponse createSession(User userEntity, RefreshToken refreshTokenEntity, HttpServletRequest httpRequest) {
        String userAgentString = httpRequest.getHeader(SecurityConstants.HEADER_USER_AGENT);
        String deviceIdValue = httpRequest.getHeader(SecurityConstants.HEADER_DEVICE_ID);
        String deviceNameValue = httpRequest.getHeader(SecurityConstants.HEADER_DEVICE_NAME);
        String clientIpAddress = ClientIpUtils.getClientIp(httpRequest);

        UserAgentParser.ParsedUserAgent parsedUserAgent = UserAgentParser.parse(userAgentString);
        String locationDisplay = getLocationFromIp(clientIpAddress);

        UserSessionCreateHelper sessionCreateHelper = UserSessionCreateHelper.builder()
                .userId(userEntity.getId())
                .refreshTokenId(refreshTokenEntity.getId())
                .deviceId(deviceIdValue != null ? deviceIdValue : generateDeviceId(userAgentString))
                .deviceName(deviceNameValue)
                .deviceType(detectDeviceType(userAgentString))
                .userAgent(userAgentString)
                .browser(parsedUserAgent.getBrowserWithVersion())
                .operatingSystem(parsedUserAgent.getOs())
                .ipAddress(clientIpAddress)
                .location(locationDisplay)
                .status(SecurityConstants.SESSION_STATUS_ACTIVE)
                .loginAt(LocalDateTime.now())
                .lastActiveAt(LocalDateTime.now())
                .expiresAt(refreshTokenEntity.getExpiryDate())
                .isCurrentSession(true)
                .build();

        UserSession sessionEntity = sessionMapper.createFromHelper(sessionCreateHelper);
        sessionRepository.save(sessionEntity);
        sessionRepository.markOtherSessionsAsNotCurrent(userEntity.getId(), sessionEntity.getId());

        userEntity.setLastLoginAt(LocalDateTime.now());
        userEntity.setLastActiveAt(LocalDateTime.now());
        userEntity.setActiveSessionsCount(sessionRepository.countActiveSessionsByUserId(userEntity.getId()).intValue());
        userRepository.save(userEntity);

        log.info("Session created successfully: user_id={}, device={}, location={}", userEntity.getId(), sessionEntity.getDeviceDisplayName(), locationDisplay);
        return sessionMapper.toResponse(sessionEntity);
    }

    @Override
    public AdminSessionResponse getSessionById(UUID sessionId) {
        UserSession sessionEntity = sessionRepository.findByIdWithUser(sessionId)
                .orElseThrow(() -> {
                    log.warn("Session not found: session_id={}", sessionId);
                    return new ResourceNotFoundException("Session not found");
                });
        log.info("Session retrieved successfully: session_id={}", sessionId);
        return sessionMapper.toAdminResponse(sessionEntity);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserSessionResponse> getAllSessions(UUID userId) {
        List<UserSessionResponse> sessionResponses = sessionMapper.toResponseList(sessionRepository.findAllSessionsByUserId(userId));
        log.info("All sessions retrieved successfully: user_id={}, session_count={}", userId, sessionResponses.size());
        return sessionResponses;
    }

    @Override
    @Transactional
    public UserSessionResponse logoutSession(UUID sessionId, UUID userId) {
        log.info("Session logout initiated: session_id={}, user_id={}", sessionId, userId);

        UserSession sessionEntity = sessionRepository.findByIdAndUserIdAndIsDeletedFalse(sessionId, userId)
                .orElseThrow(() -> {
                    log.warn("Session logout failed - session not found: session_id={}, user_id={}", sessionId, userId);
                    return new ResourceNotFoundException("Session not found");
                });

        sessionEntity.logout("User logged out");
        sessionRepository.save(sessionEntity);
        updateActiveSessionsCount(userId);

        log.info("Session logged out successfully: session_id={}, user_id={}", sessionId, userId);
        return sessionMapper.toResponse(sessionEntity);
    }

    @Override
    @Transactional
    public List<UserSessionResponse> logoutOtherSessions(UUID userId, UUID currentSessionId) {
        log.info("Other sessions logout initiated: user_id={}, current_session_id={}", userId, currentSessionId);

        List<UserSession> activeSessionRecords = sessionRepository.findActiveSessionsByUserId(userId);
        List<UserSession> loggedOutSessionRecords = new ArrayList<>();

        for (UserSession sessionEntity : activeSessionRecords) {
            if (!sessionEntity.getId().equals(currentSessionId)) {
                sessionEntity.logout("Logged out from other device");
                sessionRepository.save(sessionEntity);
                loggedOutSessionRecords.add(sessionEntity);
            }
        }

        updateActiveSessionsCount(userId);
        log.info("Other sessions logged out successfully: user_id={}, logged_out_count={}", userId, loggedOutSessionRecords.size());
        return sessionMapper.toResponseList(loggedOutSessionRecords);
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<AdminSessionResponse> getAllSessionsAdmin(SessionFilterRequest filterCriteria) {
        Pageable pageableRequest = PaginationUtils.createPageable(
                filterCriteria.getPageNo(), filterCriteria.getPageSize(), filterCriteria.getSortBy(), filterCriteria.getSortDirection()
        );

        List<String> filterStatuses = FilterUtils.nullIfEmpty(filterCriteria.getStatuses());
        List<String> filterDeviceTypes = FilterUtils.nullIfEmpty(filterCriteria.getDeviceTypes());

        Specification<UserSession> spec = UserSessionSpecification.filterSessions(
                filterCriteria.getUserId(),
                filterStatuses,
                filterDeviceTypes,
                filterCriteria.getSearch()
        );

        Page<UserSession> sessionPage = sessionRepository.findAll(spec, pageableRequest);

        log.info("Sessions fetched successfully: count={}, page={}/{}", sessionPage.getNumberOfElements(), sessionPage.getNumber() + 1, sessionPage.getTotalPages());
        return sessionMapper.toPaginationResponse(sessionPage);
    }

    @Override
    @Transactional
    public AdminSessionResponse logoutSessionAdmin(UUID sessionId) {
        log.info("Admin session logout initiated: session_id={}", sessionId);

        UserSession sessionEntity = sessionRepository.findByIdWithUser(sessionId)
                .orElseThrow(() -> {
                    log.warn("Admin session logout failed - session not found: session_id={}", sessionId);
                    return new ResourceNotFoundException("Session not found");
                });

        if (sessionEntity.isActive()) {
            sessionEntity.logout("Admin logged out");
            sessionRepository.save(sessionEntity);
            updateActiveSessionsCount(sessionEntity.getUserId());
            log.info("Admin session logged out successfully: session_id={}, user_id={}", sessionId, sessionEntity.getUserId());
        }

        return sessionMapper.toAdminResponse(sessionEntity);
    }

    @Override
    @Transactional
    public List<AdminSessionResponse> logoutAllSessionsAdmin(UUID userId) {
        log.info("All sessions admin logout initiated: user_id={}", userId);

        List<UserSession> activeSessionRecords = sessionRepository.findActiveSessionsByUserId(userId);

        for (UserSession sessionEntity : activeSessionRecords) {
            sessionEntity.logout("Admin logged out all");
            sessionRepository.save(sessionEntity);
        }

        updateActiveSessionsCount(userId);
        log.info("All sessions logged out by admin successfully: user_id={}, logged_out_count={}", userId, activeSessionRecords.size());
        return sessionMapper.toAdminResponseList(activeSessionRecords);
    }

    private void updateActiveSessionsCount(UUID userId) {
        User userEntity = userRepository.findById(userId).orElse(null);
        if (userEntity != null) {
            userEntity.setActiveSessionsCount(sessionRepository.countActiveSessionsByUserId(userId).intValue());
            userRepository.save(userEntity);
        }
    }

    private String generateDeviceId(String userAgentString) {
        return UUID.nameUUIDFromBytes((userAgentString != null ? userAgentString : "unknown").getBytes()).toString();
    }

    private String detectDeviceType(String userAgentString) {
        if (userAgentString == null) return SecurityConstants.DEVICE_TYPE_UNKNOWN;
        String lowerCaseAgent = userAgentString.toLowerCase();
        if (lowerCaseAgent.contains("mobile")) return SecurityConstants.DEVICE_TYPE_MOBILE;
        if (lowerCaseAgent.contains("tablet") || lowerCaseAgent.contains("ipad")) return SecurityConstants.DEVICE_TYPE_TABLET;
        return SecurityConstants.DEVICE_TYPE_DESKTOP;
    }

    private String getLocationFromIp(String clientIpAddress) {
        try {
            IpGeolocationService.GeoLocation geoLocation = geolocationService.getLocation(clientIpAddress);
            return geoLocation.getLocationDisplay();
        } catch (Exception e) {
            log.warn("Geolocation lookup failed: ip={}, error={}", clientIpAddress, e.getMessage());
            return "Unknown";
        }
    }
}
