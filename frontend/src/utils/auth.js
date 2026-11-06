// frontend/src/utils/auth.js

export const getUser = () => {
  const userData = localStorage.getItem("user");
  if (!userData) return null;
  try {
    return JSON.parse(userData);
  } catch (error) {
    return null;
  }
};

export const removeToken = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
};

export const logout = (navigate) => {
  removeToken();
  navigate("/");
};
