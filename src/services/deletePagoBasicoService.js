import api from "./api";

function deletePagoBasicoService(id) {
  return api.delete(`/pago-basico/${id}`);
}

export default deletePagoBasicoService;
