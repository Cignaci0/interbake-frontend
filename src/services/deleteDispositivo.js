import api from "./api";

const deleteDispositivo = async (id) => {
  const response = await api.delete(`/dispositivo/${id}`);
  return response.data;
};

export default deleteDispositivo;
