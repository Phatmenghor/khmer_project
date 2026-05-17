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

    @Mapping(target = "user", source = ".")
    @Mapping(target = "email", source = "email")
    @Mapping(target = "firstName", source = "firstName")
    @Mapping(target = "lastName", source = "lastName")
    @Mapping(target = "nickname", source = "nickname")
    @Mapping(target = "gender", source = "gender")
    @Mapping(target = "dateOfBirth", source = "dateOfBirth")
    @Mapping(target = "phoneNumber", source = "phoneNumber")
    @Mapping(target = "profileImageUrl", source = "profileImageUrl")
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
    void updateFromRequest(UserUpdateRequest request, @MappingTarget UserProfile profile);
}
