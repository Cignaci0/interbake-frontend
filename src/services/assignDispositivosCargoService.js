import api from "./api";

function assignDispositivosCargoService(data) {
  return api.post("/cargo-dispositivo/asignacion", data)
    .then(res => res.data);
}

export default assignDispositivosCargoService;
