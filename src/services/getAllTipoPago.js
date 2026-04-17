import api from "./api";

// Añadimos fechaInicio y fechaFin como parámetros
function getAllTipoPago() {
  return api.get("/tipo-pago-basico")
    .then(res => {
      return res;
    })
}

export default getAllTipoPago;