// src/utils/storage.js
import { useAuthStore } from '../stores/useAuthStore.js';
import { useUserStore } from '../stores/useUserStore.js';

/**
 * Authentication Token Management (backed by zustand store + localStorage fallback)
 */
export const getAuthToken = () => {
  try {
    const token = useAuthStore.getState().token;
    if (token) return token;
  } catch (e) {
    // fall through to localStorage
  }
  return localStorage.getItem('authToken');
};

export const setAuthToken = (token) => {
  try {
    const setToken = useAuthStore.getState().setToken;
    if (setToken) setToken(token, useAuthStore.getState().expires || null);
  } catch (e) {}
  if (token) localStorage.setItem('authToken', token); else localStorage.removeItem('authToken');
};

export const getAuthExpiry = () => {
  try {
    const expires = useAuthStore.getState().expires;
    if (expires) return expires;
  } catch (e) {}
  return localStorage.getItem('authExpires');
};

export const setAuthExpiry = (expiryDate) => {
  try {
    const setToken = useAuthStore.getState().setToken;
    if (setToken) setToken(useAuthStore.getState().token || null, expiryDate);
  } catch (e) {}
  if (expiryDate) localStorage.setItem('authExpires', expiryDate); else localStorage.removeItem('authExpires');
};

export const isTokenExpired = () => {
  const expiry = getAuthExpiry();
  if (!expiry) return true;
  return new Date() > new Date(expiry);
};

/**
 * User Data Management (backed by zustand store + localStorage fallback)
 */
export const getUserData = () => {
  try {
    const user = useUserStore.getState().user;
    if (user) return user;
  } catch (e) {}
  const userData = localStorage.getItem('userData');
  return userData ? JSON.parse(userData) : null;
};

export const setUserData = (user) => {
  try {
    const setUser = useUserStore.getState().setUser;
    if (setUser) setUser(user);
  } catch (e) {}
  if (user) localStorage.setItem('userData', JSON.stringify(user)); else localStorage.removeItem('userData');
};

/**
 * Refresh token helpers
 */
export const getRefreshToken = () => {
  try {
    // Not stored in zustand; fallback to localStorage
  } catch (e) {}
  return localStorage.getItem('refreshToken');
};

export const setRefreshToken = (token) => {
  try {
    // no-op for zustand; keep refresh token in localStorage for compatibility
  } catch (e) {}
  if (token) localStorage.setItem('refreshToken', token); else localStorage.removeItem('refreshToken');
};

/**
 * Pending profile data (used when createProfile fails during registration)
 */
export const getPendingProfileData = () => {
  try {
    const raw = localStorage.getItem('pendingProfileData');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

export const setPendingProfileData = (data) => {
  try {
    if (data) localStorage.setItem('pendingProfileData', JSON.stringify(data)); else localStorage.removeItem('pendingProfileData');
  } catch (e) {}
};

/**
 * Remembered login helpers (remember identifier & type)
 */
export const getRememberedLogin = () => {
  try {
    const raw = localStorage.getItem('rememberedLogin');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

export const setRememberedLogin = (data) => {
  try {
    if (data) localStorage.setItem('rememberedLogin', JSON.stringify(data)); else localStorage.removeItem('rememberedLogin');
  } catch (e) {}
};

/**
 * Clear All Authentication Data
 */
export const clearAuth = () => {
  try {
    const clearToken = useAuthStore.getState().clearToken;
    const clearUser = useUserStore.getState().clearUser;
    if (clearToken) clearToken();
    if (clearUser) clearUser();
  } catch (e) {}
  localStorage.removeItem('authToken');
  localStorage.removeItem('userData');
  localStorage.removeItem('authExpires');
  localStorage.removeItem('rememberedLogin');
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  try {
    const isAuth = useAuthStore.getState().isAuthenticated;
    if (typeof isAuth === 'function') return isAuth();
  } catch (e) {}
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
