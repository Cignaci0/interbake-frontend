
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export default function loginService({ usuario, contrasenia }) {
  return axios.post(`${API_URL}/auth/login`, { username: usuario, password: contrasenia })
    .then(res => {
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('username', res.data.username);
        // No se requiere perfil ni centro en el frontend
      }
      return res;
    })
    .catch(error => {
      console.error('Error al iniciar sesión:', error);
      throw error;
    });
}