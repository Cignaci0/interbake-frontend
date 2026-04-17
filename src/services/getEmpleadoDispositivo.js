import api from "./api";

/**
 * Obtiene las asignaciones especiales de dispositivos para un empleado.
 * GET /empleado-dispositivo/:empleado_id
 */
const getEmpleadoDispositivo = async (id) => {
  const response = await api.get(`/empleado-dispositivo/${id}`);
  return response.data;
};

export default getEmpleadoDispositivo;
