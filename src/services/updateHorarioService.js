import api from "./api";

function updateHorarioService(id, data) {
  return api.patch(`/horario/${id}`, data)
    .then(res => res.data);
}

export default updateHorarioService;
