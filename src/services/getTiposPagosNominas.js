import api from "./api";

// Añadimos fechaInicio y fechaFin como parámetros
function getTiposPagosNominas() {
  return api.get("/tipo-pago-nomina")
    .then(res => {
      return res;
    })
}

export default getTiposPagosNominas;