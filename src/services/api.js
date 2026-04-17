import axios from 'axios';
 const API = "http://localhost:8000"
//const API = "https://romaa-be.onrender.com"
// const API = "https://api.bib-india.com"
// const API = "https://api.maarrsmart.com"

export const api = axios.create({
  baseURL: API,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // send HTTP-only auth cookies with every request
});

// Session expired — clear auth and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || "";

    // Skip auto-logout for notification polling — let the caller handle it
    const isNotificationReq = url.startsWith("/notification");

    if (status === 401 && window.location.pathname !== "/" && !isNotificationReq) {
      localStorage.removeItem("crm_user");
      window.location.href = "/";
    }

    return Promise.reject(error);
  }
);