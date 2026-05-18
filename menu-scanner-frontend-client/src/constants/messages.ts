export const Messages = {

  auth: {
    loginSuccess: "Welcome to admin dashboard!",
    loginFailed: "Login failed",
    loginBlocked: "Business accounts must use the Admin Login page",
    loggedIn: "Welcome! You've successfully logged in.",
    accountCreated: "Welcome! Your account has been created successfully.",
    welcomeBack: "Welcome back!",
    telegramConnected: "Telegram account connected successfully!",
    telegramDisconnected: "Telegram account disconnected successfully.",
    telegramFailed: "Telegram login failed. Please try again.",
    passwordChanged: "Password changed successfully",
    passwordReset: "Password reset successfully",
    accountDeleted: "Account deleted successfully",
    deleteAccountFailed: "Failed to delete account",
  },

  profile: {
    updated: "Profile updated successfully",
    updateFailed: "Failed to update profile",
    pictureUpdated: "Profile picture updated successfully",
    pictureUpdateFailed: "Failed to update profile picture",
    pictureRemoved: "Profile picture removed successfully",
    pictureUploadFailed: "Failed to upload profile picture",
    imageUploadFailed: "Failed to upload profile image",
  },

  cart: {
    added: "Added to cart",
    updated: "Cart updated",
    cleared: "Cart cleared",
    itemUpdated: "Item updated successfully",
    removed: "Removed from cart",
    movedToCart: "Moved to cart",
    updateFailed: "Failed to update cart",
    moveToCartFailed: "Failed to move to cart",
    emptyCart: "Please add items to cart",
    setQuantity: "Please set quantity greater than 0 to add customizations",
  },

  favorites: {
    removed: "Removed from favorites",
    removeFailed: "Failed to remove from favorites",
    allCleared: "All favorites cleared",
    clearFailed: "Failed to clear favorites",
    updateFailed: "Failed to update favorites",
  },

  orders: {
    placed: "Order placed successfully! Redirecting...",
    created: "Order created successfully",
    createFailed: "Failed to create POS order",
    cancelled: "Order cancelled successfully",
    cancelFailed: "Failed to cancel order",
    pendingOnly: "Only pending orders can be cancelled",
    linkCopied: "Order link copied to clipboard",
    numberCopied: "Order number copied to clipboard",
    updated: "Updated successfully",
  },

  location: {
    created: "Location created",
    updated: "Location updated",
    deleted: "Location deleted successfully",
    deleteFailed: "Failed to delete location",
    setPrimary: "Location set as primary",
    setPrimaryFailed: "Failed to set primary location",
    coordinatesFound: "Coordinates found",
    coordinatesFailed: "Could not resolve coordinates",
    geolocationUnsupported: "Geolocation not supported",
    geolocationFailed: "Unable to get your location",
    geocodeFailed: "Failed to geocode",
    selectProvince: "Please select a province first",
    selectAtLeastProvince: "Please select at least a province",
    selectDistrict: "Please select a district first",
    selectCommune: "Please select a commune first",
  },

  product: {
    created: "Product created successfully",
    updated: "Product updated successfully",
    deleteFailed: "Failed to delete product",
    loadDetailsFailed: "Failed to load product details",
    selectSize: "Please select a size",
    selectAtLeastOne: "Please select at least one product",
    selectAtLeastOneToReset: "Please select at least one product to reset",
    invalidPrice: "Price must be a valid number greater than 0",
    invalidQuantity: "Quantity must be greater than or equal to 0",
    minQuantity: "Quantity must be at least 1",
    imagesFailed: "Failed to process images",
    mainImageFailed: "Failed to upload main image",
    statusUpdateFailed: "Failed to update product status",
  },

  promotions: {
    allReset: "All promotions reset successfully",
    allResetFull: "All promotions have been reset successfully!",
    resetFailed: "Failed to reset promotion",
    allResetFailed: "Failed to reset all promotions",
    clearingBackground: "Clearing promotions... (updating in background)",
    cleared: "Promotions cleared successfully!",
    allSelectionsCleared: "All selections cleared",
  },

  banner: {
    created: "Banner created successfully",
    updated: "Banner updated successfully",
    deleted: "Banner deleted successfully",
    statusUpdated: "Banner status updated successfully",
    statusUpdateFailed: "Failed to update banner status",
    deleteFailed: "Failed to delete banner",
    imageUploadFailed: "Failed to upload banner image. Please try again.",
  },

  brand: {
    created: "Brand created successfully",
    updated: "Brand updated successfully",
    statusUpdated: "Brand status updated successfully",
    statusUpdateFailed: "Failed to update brand status",
    deleteFailed: "Failed to delete brand",
    imageUploadFailed: "Failed to upload brand image. Please try again.",
  },

  category: {
    created: "Category created successfully",
    updated: "Category updated successfully",
    statusUpdated: "Category status updated successfully",
    statusUpdateFailed: "Failed to update category status",
    deleteFailed: "Failed to delete categories",
  },

  payment: {
    created: "Payment option created successfully",
    updated: "Payment option updated successfully",
    statusUpdated: "Payment option status updated",
    statusUpdateFailed: "Failed to update payment option status",
    deleteFailed: "Failed to delete Payment option",
    saveFailed: "Failed to save payment option",
    selectMethod: "Please select a payment method",
  },

  delivery: {
    created: "Delivery options created successfully",
    updated: "Delivery options updated successfully",
    statusUpdated: "Delivery option status updated successfully",
    statusUpdateFailed: "Failed to update delivery option status",
    deleteFailed: "Failed to delete Delivery options",
    selectOption: "Please select a delivery option",
    selectAddress: "Please select a delivery address",
  },

  exchangeRate: {
    created: "Exchange rate created successfully",
    updated: "Exchange rate updated successfully",
    deleteFailed: "Failed to delete Exchange Rate",
  },

  business: {
    settingsUpdated: "Business settings updated successfully",
    settingsUpdateFailed: "Failed to update business settings",
    settingsLoadFailed: "Failed to load business settings",
    profileUpdated: "Business profile updated successfully!",
    logoSelected: "Logo selected - click Save Changes to upload",
    logoUploadFailed: "Failed to upload logo",
  },

  reviews: {
    approved: "Review approved successfully",
    rejected: "Review rejected",
    responseSaved: "Response added successfully",
    enterResponse: "Please enter a response",
    selectRating: "Please select a rating",
  },

  users: {
    statusUpdated: "User business status updated successfully",
    statusUpdateFailed: "Failed to update user business status",
    deleteFailed: "Failed to delete user business",
    roleDeleteFailed: "Failed to delete roles",
    sessionDeleteFailed: "Failed to delete session",
  },

  hr: {
    attendanceUpdated: "Attendance updated successfully",
    attendanceDeleteFailed: "Failed to delete attendance",
    attendanceUpdateFailed: "Failed to update attendance",
    leaveDeleteFailed: "Failed to delete leave",
    leaveIdRequired: "Leave ID is required",
    leaveTypeDeleteFailed: "Failed to delete leave type",
    workScheduleDeleteFailed: "Failed to delete work schedule",
  },

  upload: {
    imageFailed: "Failed to upload image",
    orderError: "Error updating order",
  },

  clipboard: {
    linkCopied: "Link copied to clipboard",
    addressCopied: "Address copied!",
  },

  validation: {
    requiredFields: "Please complete all required fields",
    saveFailed: "Error saving changes. Please try again.",
  },
} as const;
