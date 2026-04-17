import api from "./api";

export default function getDetallePagoNomina(id) {
  return api.get(`/pago-nomina/${id}`)
    .then(res => res)
}