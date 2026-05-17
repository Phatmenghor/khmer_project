package com.emenu.features.auth.mapper;

import com.emenu.features.auth.dto.request.AddressRequest;
import com.emenu.features.auth.dto.request.DocumentRequest;
import com.emenu.features.auth.dto.request.EducationRequest;
import com.emenu.features.auth.dto.request.EmergencyContactRequest;
import com.emenu.features.auth.models.User;
import com.emenu.features.auth.models.UserAddress;
import com.emenu.features.auth.models.UserDocument;
import com.emenu.features.auth.models.UserEducation;
import com.emenu.features.auth.models.UserEmergencyContact;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring")
public interface UserNestedEntitiesMapper {

    default UserAddress createAddress(AddressRequest request, User user) {
        UserAddress address = new UserAddress();
        address.setUser(user);
        updateAddress(request, address);
        return address;
    }

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateAddress(AddressRequest request, @MappingTarget UserAddress address);

    default UserEmergencyContact createContact(EmergencyContactRequest request, User user) {
        UserEmergencyContact contact = new UserEmergencyContact();
        contact.setUser(user);
        updateContact(request, contact);
        return contact;
    }

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateContact(EmergencyContactRequest request, @MappingTarget UserEmergencyContact contact);

    default UserDocument createDocument(DocumentRequest request, User user) {
        UserDocument document = new UserDocument();
        document.setUser(user);
        updateDocument(request, document);
        return document;
    }

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateDocument(DocumentRequest request, @MappingTarget UserDocument document);

    default UserEducation createEducation(EducationRequest request, User user) {
        UserEducation education = new UserEducation();
        education.setUser(user);
        updateEducation(request, education);
        return education;
    }

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEducation(EducationRequest request, @MappingTarget UserEducation education);
}
