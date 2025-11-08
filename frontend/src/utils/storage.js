// src/utils/storage.js

/**
 * Authentication Token Management
 */
export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

export const setAuthToken = (token) => {
  localStorage.setItem('authToken', token);
};

export const getAuthExpiry = () => {
  return localStorage.getItem('authExpires');
};

export const setAuthExpiry = (expiryDate) => {
  localStorage.setItem('authExpires', expiryDate);
};

export const isTokenExpired = () => {
  const expiry = getAuthExpiry();
  if (!expiry) return true;
  
  return new Date() > new Date(expiry);
};

/**
 * User Data Management
 */
export const getUserData = () => {
  const userData = localStorage.getItem('userData');
  return userData ? JSON.parse(userData) : null;
};

export const setUserData = (user) => {
  localStorage.setItem('userData', JSON.stringify(user));
};

/**
 * Clear All Authentication Data
 */
export const clearAuth = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userData');
  localStorage.removeItem('authExpires');
  localStorage.removeItem('rememberedLogin');
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  const token = getAuthToken();
  const expired = isTokenExpired();
  
  return token && !expired;
};

/**
 * Get user role
 */
export const getUserRole = () => {
  const user = getUserData();
  return user?.role || null;
};

/**
 * Check if user has specific role
 */
export const hasRole = (role) => {
  return getUserRole() === role;
};

/**
 * Check if user is admin
 */
export const isAdmin = () => {
  return hasRole('admin');
};

/**
 * Check if user is staff
 */
export const isStaff = () => {
  return hasRole('staff');
};

/**
 * Check if user is co-owner
 */
export const isCoOwner = () => {
  return hasRole('co-owner');
};
