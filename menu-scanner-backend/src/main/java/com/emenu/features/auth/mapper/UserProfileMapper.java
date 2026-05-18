package com.emenu.features.auth.mapper;

import com.emenu.features.auth.dto.request.UserCreateRequest;
import com.emenu.features.auth.dto.update.UserUpdateRequest;
import com.emenu.features.auth.models.User;
import com.emenu.features.auth.models.UserProfile;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring")
public interface UserProfileMapper {

    default UserProfile createFromRequest(UserCreateRequest request, User user) {
        UserProfile profile = new UserProfile();
        profile.setUser(user);
        profile.setEmail(request.getEmail());
        profile.setFirstName(request.getFirstName());
        profile.setLastName(request.getLastName());
        profile.setNickname(request.getNickname());
        profile.setGender(request.getGender());
        profile.setDateOfBirth(request.getDateOfBirth());
        profile.setPhoneNumber(request.getPhoneNumber());
        profile.setProfileImageUrl(request.getProfileImageUrl());
        return profile;
    }

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "isDeleted", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    @Mapping(target = "deletedBy", ignore = true)
    @Mapping(target = "auditorAware", ignore = true)
    void updateFromRequest(UserUpdateRequest request, @MappingTarget UserProfile profile);
}
