import api from "./api";

function editarPagosASolicitud(idSolicitud, data) {
  // Ahora envía PATCH a /solicitud-pago/editar-solicitud/{id}
  return api.patch(`/solicitud-pago/editar-solicitud/${idSolicitud}`, data);
}

export default editarPagosASolicitud;
