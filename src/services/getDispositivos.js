import api from "./api";

function getDispositivos() {
  return api.get("/dispositivo")
    .then(res => res.data);
}

export default getDispositivos;
