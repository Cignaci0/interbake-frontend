import api from "./api";

function updateCargoService(id, data) {
  return api.patch(`/cargo/${id}`, data)
    .then(res => res.data);
}

export default updateCargoService;
