import api from "./api";

// Añadimos fechaInicio y fechaFin como parámetros
function getCuentaCargoCentro(id_centro) {
  return api.get(`cuenta-cargo-cenco/${id_centro}`)
    .then(res => {
      return res;
    })
}

export default getCuentaCargoCentro;