import api from "./api";

function createDispositivoService(data) {
  return api.post("/dispositivo", data)
    .then(res => res.data);
}

export default createDispositivoService;
