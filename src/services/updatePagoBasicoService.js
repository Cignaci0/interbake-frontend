import api from "./api";

function updatePagoBasicoService(id, data) {
  const formData = new FormData();

  // Campos básicos
  formData.append("numero_factura", data.nroFactura);
  formData.append("id_pago_basico", Number(data.tipoPago));
  formData.append("monto_pago", Number(data.montoPago));
  formData.append("fecha_periodo_inicio", data.start);
  formData.append("fecha_periodo_fin", data.end);
  formData.append("numero_cuenta_cargo", data.cuentaCorriente);

  // Solo adjuntar el archivo si realmente existe (si es null, no se envía el campo)
  if (data.archivo) {
    formData.append("archivo", data.archivo);
  }

  // Restaurar id_cenco si es necesario (estaba en la versión anterior)
  const cencoId = localStorage.getItem("centro_id");
  if (cencoId && cencoId !== "null") {
    formData.append("id_cenco", Number(cencoId));
  }

  return api.patch(`/pago-basico/${id}`, formData);
}

export default updatePagoBasicoService;
