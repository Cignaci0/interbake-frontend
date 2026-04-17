import api from "./api";

function getDetalleTurno(idTurno) {
  return api.get(`/detalle-turno/turno/${idTurno}`)
    .then(res => res.data);
}

export default getDetalleTurno;
