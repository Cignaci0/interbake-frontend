import api from "./api";

function createTurnoService(data) {
  return api.post("/turno", data)
    .then(res => res.data);
}

export default createTurnoService;
