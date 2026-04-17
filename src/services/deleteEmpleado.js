import api from "./api";

const deleteEmpleado = async (id) => {
  const response = await api.delete(`/empleado/${id}`);
  return response.data;
};

export default deleteEmpleado;
