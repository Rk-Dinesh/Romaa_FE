import axios from 'axios';
const API = "http://localhost:8000"
// const API = "https://romaa-be.onrender.com"
// const API = "https://api.bib-india.com"

export const api = axios.create({
  baseURL: API,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Session expired — clear auth and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401 && window.location.pathname !== "/") {
      localStorage.removeItem("crm_user");
      window.location.href = "/";
    }

    return Promise.reject(error);
  }
);