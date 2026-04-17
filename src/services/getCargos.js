import api from "./api";

function getCargos() {
  return api.get("/cargo")
    .then(res => {
      return res.data
    });
}

export default getCargos;
