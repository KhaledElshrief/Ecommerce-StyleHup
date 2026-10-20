import axios from "axios";

const BASE_URL = "http://localhost:5000/api/";

const getToken = () => {
  try {
    const user = JSON.parse(localStorage.getItem("persist:root"))?.user;
    const currentUser = user && JSON.parse(user).currentUser;
    return currentUser?.accessToken;
  } catch {
    return undefined;
  }
};

export const publicRequest = axios.create({
  baseURL: BASE_URL,
});

export const userRequest = axios.create({
  baseURL: BASE_URL,
});

userRequest.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.token = `Bearer ${token}`;
  return config;
});
