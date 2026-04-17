import api from "./api";

const deleteTurno = async (id) => {
  const response = await api.delete(`/turno/${id}`);
  return response.data;
};

export default deleteTurno;
