import axios from "axios"

export const axiosInstance =axios.create({
    baseURL:"http://localhost:5001/api",
    withCredentials:true,
});
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem("auth-token");
    if (token) {
      config.headers["auth-token"] = token;
    }
    return config;
  });