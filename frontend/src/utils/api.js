// src/utils/api.js
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api', // adjust to match your backend
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
