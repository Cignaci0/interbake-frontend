import api from "./api";

/**
 * Obtiene el listado de empleados con paginación.
 * GET /empleado?page=1&limit=15
 *
 * Respuesta: {
 *   data: [{ empleado_id, run, nombres, apellido_paterno, apellido_materno,
 *             cargo_id: { cargo_id, nombre, ... },
 *             cenco_id: { cenco_id, nombre, ... },
 *             fecha_ini_contrato, fecha_fin_contrato, contrato_indefinido, art_22, ... }],
 *   meta: { total, page, limit, totalPages }
 * }
 */
function getEmpleados(page = 1, limit = 15) {
  return api.get("/empleado", { params: { page, limit } })
    .then(res => res.data);
}

export default getEmpleados;
