/**
 * Central export file for shared components, utilities, and factories
 * Makes it easy to import commonly used components across the app
 */
export { SpacesImageUpload } from "./form-field/spaces-image-upload";

// Form Components
export { TextField } from "./form-field/text-field";
export { TextareaField } from "./form-field/text-area-field";
export { TimePickerField } from "./form-field/time-picker-field";
export { PasswordField } from "./form-field/password-field";
export { DateTimePickerField } from "./form-field/date-picker-field";
export { SelectField } from "./form-field/select-field";
export { ClickableImageUpload } from "./form-field/clickable-image-upload";
export type { BaseFormFieldProps, TextFormFieldProps, TextareaFormFieldProps } from "./form-field/form-field-types";

// Combobox Components & Factories
export { ComboboxSelectFactory, createComboboxSelect } from "./combobox/combobox-select-factory";
export { BrandCombobox, CategoryCombobox } from "./combobox/combobox-factory-examples";
export type { ComboboxOption, ComboboxSelectFactoryProps } from "./combobox/combobox-select-factory";

// Image Component
export { SmartImage } from "./image/smart-image";
export type { SmartImageProps } from "./image/smart-image";

// Card Components
export { BrandCard } from "./card/brand-card";
export { CategoryCard } from "./card/category-card";
export { GenericCard } from "./card/generic-card";
export type { GenericCardProps } from "./card/generic-card";

// Modal Components & Base Classes
export { FormDialogBase, FormDialogBaseWithCustomActions } from "./modal/form-dialog-base";
export { LoginModal } from "./modal/login-modal";
export { RegisterModal } from "./modal/register-modal";
export { default as ChangePasswordModal } from "./modal/change-password-modal";
export { DeleteConfirmationModal } from "./modal/delete-confirmation-modal";
export { CustomModal } from "./modal/custom-modal";
export type { CustomModalProps, ModalSize } from "./modal/custom-modal";
export type { FormDialogBaseProps } from "./modal/form-dialog-base";

// Common Components
export { PageContainer } from "./common/page-container";
export { CustomButton, SubmitButton, CancelButton, ActionButton, ConditionalActionButton } from "./button/custom-button";
export { EmptyState } from "./empty-state/empty-state";
export { CustomAvatar } from "./avatar/custom-avatar";

// Layout Components
export { PageHeader } from "./common/page-header";
export { SectionHeader } from "./common/section-header";
export { CustomCheckbox } from "./common/custom-checkbox";
export { CustomDropdownMenu } from "./common/custom-dropdown-menu";
