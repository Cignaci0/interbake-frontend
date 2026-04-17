import api from "./api";

// Filtro por fecha de solicitud (Desde/Hasta)
function getPagosNominas(page, limit, tipoPagoId, estadoId, fechaSolicitudInicio, fechaSolicitudFin, idSolicitud, cencoId) {
  const params = {
    page,
    limit,
    ...(tipoPagoId && { tipoPagoId }),
    ...(estadoId !== null && estadoId !== undefined && { estadoId }),
    ...(fechaSolicitudInicio && { fechaSolicitud: fechaSolicitudInicio }),
    ...(fechaSolicitudFin && { fechaSolicitudFin }),
    ...(idSolicitud && { idSolicitud }),
    ...(cencoId && { cencoId })
  };

  return api.get("/solicitud-pago", { params })
    .then(res => {
      return res;
    });
}

export default getPagosNominas;