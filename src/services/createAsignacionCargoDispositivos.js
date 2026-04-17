import api from "./api";

function createAsignacionCargoDispositivos(payload) {
  return api.post("/cargo-dispositivo/asignacion", payload)
    .then(res => res.data);
}

export default createAsignacionCargoDispositivos;
