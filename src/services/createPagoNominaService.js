import api from "./api";

function createPagoNominaService(data) {
  const formData = new FormData();

  formData.append("id_solicitud_pago", 0);
  formData.append("numero_cuenta_cargo", data.cuentaCargo);
  formData.append("numero_cuenta_destino", data.numeroCuentaDestino);
  formData.append("rut_beneficiario", data.rutBeneficiario);
  formData.append("nombre_beneficiario", data.nombreBeneficiario);
  formData.append("monto_transferencia", Number(data.montoTransferencia));
  formData.append("numero_factura_boleta", data.numeroFacturaBoleta);
  formData.append("numero_orden_compra", data.ordenCompra);
  formData.append("id_pago_nomina", Number(data.tipoPago));
  formData.append("mensaje_destinatario", data.detallePago);
  formData.append("email_destinatario", data.emailPrograma);
  formData.append("cuenta_destino_inscrita", data.cuentaDestino);
  formData.append("estado", 0); // Pendiente
  formData.append("id_banco", data.bancoBeneficiario);
  formData.append("usuario_ins", localStorage.getItem("username"));

  const cencoId = localStorage.getItem("centro_id");
  formData.append("id_cenco", (cencoId && cencoId !== "null") ? Number(cencoId) : 0);

  console.log(data);


  if (data.archivo) {
    formData.append("archivo", data.archivo);
  }

  return api.post("/pago-nomina", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

export default createPagoNominaService;
