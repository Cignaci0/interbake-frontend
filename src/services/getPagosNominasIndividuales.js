import api from "./api";

function getPagosNominasIndividuales(page, limit, tipoPagoId, estadoId, fechaCreacion, cencoId) {
  const params = {
    page,
    limit,
    ...(tipoPagoId && { tipoPagoId }),
    ...(estadoId !== null && estadoId !== undefined && { estadoId }),
    ...(fechaCreacion && { fechaCreacion }),
    ...(cencoId && { cencoId })
  };

  return api.get("/pago-nomina", { params })
    .then(res => res);
}

export default getPagosNominasIndividuales;
