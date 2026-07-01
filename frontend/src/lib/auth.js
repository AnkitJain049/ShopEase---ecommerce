// Simple token utilities for JWT auth

export const TOKEN_STORAGE_KEY = 'shopease_jwt';

export function setToken(token) {
  try {
    if (token) sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
  } catch (_) {}
}

export function getToken() {
  try {
    return sessionStorage.getItem(TOKEN_STORAGE_KEY) || null;
  } catch (_) {
    return null;
  }
}

export function clearToken() {
  try {
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch (_) {}
}

export function getAuthHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

