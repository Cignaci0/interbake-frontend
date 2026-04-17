import api from "./api";

/**
 * Crea un nuevo empleado.
 * POST /empleado
 * @param {Object} data 
 */
function createEmpleado(data) {
  return api.post("/empleado", data)
    .then(res => res.data);
}

export default createEmpleado;
