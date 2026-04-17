import api from "./api";

const deleteCargo = async (id) => {
  const response = await api.delete(`/cargo/${id}`);
  return response.data;
};

export default deleteCargo;
