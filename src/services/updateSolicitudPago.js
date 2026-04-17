import api from "./api";

function updateSolicitudPago(idSolicitudPago, usuario, file = null, estadoId = null, motivoRechazo = null, fechaPago = null) {
  const formData = new FormData();

  if (file) {
    formData.append('archivo', file);
  }

  formData.append('usuario_upd', usuario);

  if (estadoId !== null) {
    formData.append('estado', estadoId);
  }

  if (motivoRechazo !== null) {
    formData.append('motivo_rechazo', motivoRechazo ?? '');
  }

  if (fechaPago) {
    formData.append('fecha_pago', fechaPago);
  }

  return api.patch(`/solicitud-pago/${idSolicitudPago}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
}

export default updateSolicitudPago;
