import api from "./api";

/**
 * Actualiza la información de un empleado.
 * PATCH /empleado/actualizar/:id
 * @param {number|string} id 
 * @param {Object} data 
 */
function updateEmpleado(id, data) {
  return api.patch(`/empleado/actualizar/${id}`, data)
    .then(res => res.data);
}

export default updateEmpleado;
