import api from "./api";

function getHorarios() {
  return api.get("/horario")
    .then(res => res.data);
}

export default getHorarios;
