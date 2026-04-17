import api from "./api";

function createHorarioService(data) {
  return api.post("/horario", data)
    .then(res => res.data);
}

export default createHorarioService;
