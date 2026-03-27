/**
 * User-related enum constants matching backend enums
 */

export enum AddressType {
  CURRENT = "CURRENT",
  PLACE_OF_BIRTH = "PLACE_OF_BIRTH",
}

export enum DocumentType {
  ID_CARD = "ID_CARD",
  FAMILY_BOOK = "FAMILY_BOOK",
  PASSPORT = "PASSPORT",
  BIRTH_CERTIFICATE = "BIRTH_CERTIFICATE",
}

export enum EducationLevel {
  HIGH_SCHOOL = "HIGH_SCHOOL",
  DIPLOMA = "DIPLOMA",
  BACHELOR = "BACHELOR",
  MASTER = "MASTER",
  DOCTORATE = "DOCTORATE",
}

export const ADDRESS_TYPE_OPTIONS = [
  { value: AddressType.CURRENT, label: "Current Address" },
  { value: AddressType.PLACE_OF_BIRTH, label: "Place of Birth" },
];

export const DOCUMENT_TYPE_OPTIONS = [
  { value: DocumentType.ID_CARD, label: "ID Card" },
  { value: DocumentType.FAMILY_BOOK, label: "Family Book" },
  { value: DocumentType.PASSPORT, label: "Passport" },
  { value: DocumentType.BIRTH_CERTIFICATE, label: "Birth Certificate" },
];

export const EDUCATION_LEVEL_OPTIONS = [
  { value: EducationLevel.HIGH_SCHOOL, label: "High School" },
  { value: EducationLevel.DIPLOMA, label: "Diploma" },
  { value: EducationLevel.BACHELOR, label: "Bachelor" },
  { value: EducationLevel.MASTER, label: "Master" },
  { value: EducationLevel.DOCTORATE, label: "Doctorate" },
];
