import api from "./api";

function createAsignacionTurnoService(data) {
  return api.post("/detalle-turno/asignacion", data)
    .then(res => res.data);
}

export default createAsignacionTurnoService;
