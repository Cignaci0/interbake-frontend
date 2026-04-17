import api from "./api";

function getCencos() {
  return api.get("/cenco")
    .then(res => res.data);
}

export default getCencos;
