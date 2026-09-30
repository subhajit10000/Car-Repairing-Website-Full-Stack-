// Shared helpers around the auth data that LoginForm / RegisterForm already
// write to localStorage (when "remember me" is checked) or sessionStorage.
// Centralizing this here so every page/service reads the same keys the same way.

const ACCESS_TOKEN_KEY = "accessToken";
const USER_KEY = "user";

const getAccessToken = () =>
  localStorage.getItem(ACCESS_TOKEN_KEY) ||
  sessionStorage.getItem(ACCESS_TOKEN_KEY) ||
  null;

const getCurrentUser = () => {
  const raw = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);

  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const isAuthenticated = () => Boolean(getAccessToken());

const clearAuth = () => {
  [localStorage, sessionStorage].forEach((store) => {
    store.removeItem(ACCESS_TOKEN_KEY);
    store.removeItem(USER_KEY);
  });
};

// Writes a fresh login/register session. Always clears BOTH storages first:
// getAccessToken() above checks localStorage before sessionStorage, so a
// leftover token from an earlier "remember me" session (e.g. an account
// that's since been deleted, or a database that's been reseeded) would
// otherwise keep being used even after a brand new, valid login — which is
// exactly what causes a confusing "User not found" error on a later request.
const setAuthSession = (accessToken, user, persist = false) => {
  clearAuth();

  const store = persist ? localStorage : sessionStorage;

  if (accessToken) {
    store.setItem(ACCESS_TOKEN_KEY, accessToken);
  }

  if (user) {
    store.setItem(USER_KEY, JSON.stringify(user));
  }
};

export {
  getAccessToken,
  getCurrentUser,
  isAuthenticated,
  clearAuth,
  setAuthSession,
};
