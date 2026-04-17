import api from "./api";

function agregarPagosASolicitud(data) {
  return api.post("/pago-nomina/crear-solicitud", data);
}

export default agregarPagosASolicitud;
