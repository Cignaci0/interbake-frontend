import api from "./api";

function getTurnos() {
  return api.get("/turno")
    .then(res => res.data);
}

export default getTurnos;
