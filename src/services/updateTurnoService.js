import api from "./api";

function updateTurnoService(id, data) {
  return api.patch(`/turno/${id}`, data)
    .then(res => res.data);
}

export default updateTurnoService;
