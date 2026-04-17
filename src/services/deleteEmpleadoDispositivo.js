import api from "./api";

/**
 * Elimina una asignacion especial de dispositivo.
 * DELETE /empleado-dispositivo/:id
 */
const deleteEmpleadoDispositivo = async (id) => {
  const response = await api.delete(`/empleado-dispositivo/${id}`);
  return response.data;
};

export default deleteEmpleadoDispositivo;
