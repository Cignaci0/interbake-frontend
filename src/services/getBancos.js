import api from "./api";

function getBancos() {
  return api.get("/banco")
    .then(res => res);
}

export default getBancos;
