import api from "./api";

function updateTipoPago(id, file, usuario, estadoId, motivoRechazo, fechaPago) {
  const formData = new FormData();
  if (file) {
    const now = new Date();
    const timestamp = now.getFullYear().toString()
      + String(now.getMonth() + 1).padStart(2, '0')
      + String(now.getDate()).padStart(2, '0')
      + String(now.getHours()).padStart(2, '0')
      + String(now.getMinutes()).padStart(2, '0')
      + String(now.getSeconds()).padStart(2, '0');
    const renamedFile = new File([file], `pagoBasicoBoletaBanco_${timestamp}.pdf`, { type: file.type });
    formData.append('archivo', renamedFile);
  }
  formData.append('usuario_upd', usuario);
  formData.append('estado', estadoId);
  formData.append('motivo_rechazo', motivoRechazo ?? '');
  formData.append('fecha_pago', fechaPago);

  return api.patch(`/pago-basico/${id}/boleta-banco`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
}

export default updateTipoPago;