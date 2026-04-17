import api from "./api";

function obtenerTodosPorEstadoId(estadoId) {
  const params = {
    ...(estadoId !== null && { estadoId }),
  };
  return api.get(`/pago-nomina/obtener-todos`, { params })
    .then(res => {
      return res;
    });
}

export default obtenerTodosPorEstadoId;