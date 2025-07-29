import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:8001/", // or your real domain
  withCredentials: true, // allows Django to set cookies
});

// Optional: redirect to login on 401
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default axiosClient;
