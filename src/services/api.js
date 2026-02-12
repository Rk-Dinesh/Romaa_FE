import axios from 'axios';
const API = "http://localhost:5000"
// const API = "https://romaa-be.onrender.com"
// const API = "https://api.bib-india.com"

export const api = axios.create({
  baseURL: API,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optional: Add Interceptors for Tokens here later
// api.interceptors.request.use((config) => { ... });