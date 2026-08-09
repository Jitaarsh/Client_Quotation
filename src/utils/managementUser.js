export const MANAGEMENT_EMAIL = "management@unicrop.com";

export const isManagementUser = (user) =>
  user?.email?.toLowerCase() === MANAGEMENT_EMAIL;
