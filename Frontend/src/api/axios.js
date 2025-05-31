// Importer les dépendances nécessaires
import axios from 'axios';
import { toast } from 'react-toastify';

// Créer une instance Axios
const api = axios.create({
  baseURL: 'http://gestion-presence-iut.test',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Intercepteur pour ajouter le token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur pour gérer les erreurs

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || 'Une erreur est survenue';
    toast.error(message, {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: 'light',
      style: { backgroundColor: '#E74C3C', color: '#FFFFFF' },
    });
    return Promise.reject(error);
  }
);

export default api;


// import axios from "axios";

// const instance = axios.create({
//   baseURL: "http://gestion-presence-iut.test/api", // Ton backend API
//   headers: {
//     Accept: "application/json",
//     "Content-Type": "application/json",
//   },
// });

// export default instance;
