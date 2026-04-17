import api from "./api";

// Añadimos fechaInicio, fechaFin e id_cenco como parámetros
function getPagosBasicos(page, limit, tipoPagoId, estadoId, fechaInicio, fechaFin) {
  const params = {
    page,
    limit,
    ...(tipoPagoId && { tipoPagoId }),
    // Si estadoId puede ser 0 (falso), es mejor validarlo con != null
    ...(estadoId !== null && { estadoId }),
    // Añadimos las fechas solo si existen
    ...(fechaInicio && { fechaInicio }),
    ...(fechaFin && { fechaFin })
  };

  return api.get("/pago-basico", { params })
    .then(res => {
      return res;
    });
}

export default getPagosBasicos;