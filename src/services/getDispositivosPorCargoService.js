import api from "./api";

function getDispositivosPorCargoService(cargoId) {
  return api.get(`/cargo-dispositivo/cargo/${cargoId}`)
    .then(res => res.data);
}

export default getDispositivosPorCargoService;
