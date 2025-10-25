// src/utils/localStorage.js
export const getUserFromLocalStorage = () => {
  try {
    const storedUser = localStorage.getItem('userData');
    if (!storedUser) return null;
    const parsedUser = JSON.parse(storedUser);
    return parsedUser;
  } catch (error) {
    console.error("Failed to parse user from localStorage:", error);
    return null;
  }
};

export const getAdminFromLocalStorage = () => {
  try {
    const storedAdmin = localStorage.getItem('adminData');
    if (!storedAdmin) return null;
    const parsedAdmin = JSON.parse(storedAdmin);
    return parsedAdmin;
  } catch (error) {
    console.error("Failed to parse admin from localStorage:", error);
    return null;
  }
};

export const setUserToLocalStorage = (userData, token) => {
  localStorage.setItem('userData', JSON.stringify(userData));
  localStorage.setItem('authToken', token);
};

export const setAdminToLocalStorage = (adminData, token) => {
  localStorage.setItem('adminData', JSON.stringify(adminData));
  localStorage.setItem('adminToken', token);
};

export const removeUserFromLocalStorage = () => {
  localStorage.removeItem('userData');
  localStorage.removeItem('authToken');
};

export const removeAdminFromLocalStorage = () => {
  localStorage.removeItem('adminData');
  localStorage.removeItem('adminToken');
};

export const getToken = () => {
  return localStorage.getItem('authToken');
};

export const getAdminToken = () => {
  return localStorage.getItem('adminToken');
};

// Device ID functions
export const storeDeviceId = (deviceId) => {
  localStorage.setItem('deviceId', deviceId);
};

export const getDeviceId = () => {
  return localStorage.getItem('deviceId');
};

export const clearDeviceId = () => {
  localStorage.removeItem('deviceId');
};

// Impersonation functions
export const setImpersonationData = (originalToken, originalAdminData) => {
  localStorage.setItem('originalToken', originalToken);
  localStorage.setItem('originalAdminData', JSON.stringify(originalAdminData));
};

export const getImpersonationData = () => {
  const originalToken = localStorage.getItem('originalToken');
  const originalAdminData = localStorage.getItem('originalAdminData');
  return {
    originalToken,
    originalAdminData: originalAdminData ? JSON.parse(originalAdminData) : null
  };
};

export const clearImpersonationData = () => {
  localStorage.removeItem('originalToken');
  localStorage.removeItem('originalAdminData');
};

// Clear all auth data
export const clearAllAuthData = () => {
  removeUserFromLocalStorage();
  removeAdminFromLocalStorage();
  clearDeviceId();
  clearImpersonationData();
};