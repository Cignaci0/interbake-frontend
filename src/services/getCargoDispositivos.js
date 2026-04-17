import api from "./api";

function getCargoDispositivos(cargoId) {
  return api.get(`/cargo-dispositivo/cargo/${cargoId}`)
    .then(res => res.data);
}

export default getCargoDispositivos;
