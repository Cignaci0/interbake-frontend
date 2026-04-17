import api from "./api";

function createCargoService(data) {
  return api.post("/cargo", data)
    .then(res => res.data);
}

export default createCargoService;
