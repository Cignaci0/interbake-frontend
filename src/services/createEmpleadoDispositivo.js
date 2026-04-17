import api from "./api";

/**
 * Crea una asignacion especial de dispositivo para un empleado.
 * POST /empleado-dispositivo
 */
const createEmpleadoDispositivo = async (payload) => {
  const response = await api.post("/empleado-dispositivo", payload);
  return response.data;
};

export default createEmpleadoDispositivo;
