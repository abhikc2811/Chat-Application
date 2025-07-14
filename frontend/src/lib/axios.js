import axios from "axios"

export const axiosInstance =axios.create({
    baseURL:"https://chat-application-pp2j.onrender.com/api",
    withCredentials:true,
});
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem("auth-token");
    if (token) {
      config.headers["auth-token"] = token;
    }
    return config;
  });
