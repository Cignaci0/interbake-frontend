import api from "./api";

function createPagoBasicoService(data) {
  const formData = new FormData();

  // Mapeo según el DTO: CreatePagoBasicoDto
  formData.append("numero_factura", data.nroFactura);
  formData.append("id_pago_basico", Number(data.tipoPago));
  formData.append("monto_pago", Number(data.montoPago));
  formData.append("estado", 0); // Por defecto: 1
  formData.append("fecha_periodo_inicio", data.start);
  formData.append("fecha_periodo_fin", data.end);
  formData.append("usuario_ins", localStorage.getItem("username"));
  formData.append("numero_cuenta_cargo", data.cuentaCorriente);

  // Archivo adjunto
  if (data.archivo) {
    formData.append("archivo", data.archivo);
  }

  return api.post("/pago-basico", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

export default createPagoBasicoService;
