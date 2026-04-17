import api from "./api";

function updateDispositivoService(id, data) {
  return api.patch(`/dispositivo/${id}`, data)
    .then(res => res.data);
}

export default updateDispositivoService;
