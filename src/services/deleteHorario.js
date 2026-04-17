import api from "./api";

const deleteHorario = async (id) => {
  const response = await api.delete(`/horario/${id}`);
  return response.data;
};

export default deleteHorario;
