import api from "./api";

function updatePagoNominaService(id, data) {
  const formData = new FormData();

  formData.append("numero_cuenta_cargo", data.cuentaCargo);
  formData.append("numero_cuenta_destino", data.numeroCuentaDestino);
  formData.append("rut_beneficiario", data.rutBeneficiario);
  formData.append("nombre_beneficiario", data.nombreBeneficiario);
  formData.append("monto_transferencia", Number(data.montoTransferencia));
  formData.append("numero_factura_boleta", data.numeroFacturaBoleta);
  formData.append("tipoPagoNomina", Number(data.tipoPago));
  formData.append("mensaje_destinatario", data.detallePago || "");
  formData.append("email_destinatario", data.emailPrograma || "");
  formData.append("cuenta_destino_inscrita", data.cuentaDestino || "");
  formData.append("id_banco", data.bancoBeneficiario);

  if (data.ordenCompra) {
    formData.append("numero_orden_compra", data.ordenCompra);
  }

  if (data.archivo) {
    formData.append("archivo", data.archivo);
  }

  return api.patch(`/pago-nomina/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

export default updatePagoNominaService;
