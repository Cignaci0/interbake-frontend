import api from "./api";

function deletePagoNominaService(id) {
  return api.delete(`/pago-nomina/${id}`);
}

export default deletePagoNominaService;
