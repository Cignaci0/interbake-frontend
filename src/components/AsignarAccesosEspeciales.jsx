import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Field,
  Flex,
  Input,
  Stack,
  Table,
  Text,
  IconButton,
  Grid
} from "@chakra-ui/react";
import { LuTrash2, LuPlus } from "react-icons/lu";
import toast from "react-hot-toast";
import getEmpleadoDispositivo from "../services/getEmpleadoDispositivo";
import createEmpleadoDispositivo from "../services/createEmpleadoDispositivo";
import deleteEmpleadoDispositivo from "../services/deleteEmpleadoDispositivo";
import getDispositivos from "../services/getDispositivos";

export default function AsignarAccesosEspeciales({ empleado, onCancel }) {
  const [listado, setListado] = useState([]);
  const [dispositivos, setDispositivos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    dispositivo_id: "",
    fecha_entrada: new Date().toISOString().split('T')[0],
    fecha_salida: new Date().toISOString().split('T')[0],
    hora_entrada: "09:00",
    hora_salida: "18:00"
  });

  const fetchData = async () => {
    setLoadingList(true);
    try {
      // Intentar cargar dispositivos (siempre debería funcionar si hay red)
      try {
        const resDispositivos = await getDispositivos();
        setDispositivos(Array.isArray(resDispositivos) ? resDispositivos : (resDispositivos?.data || []));
      } catch (err) {
        console.error("Error al cargar dispositivos:", err);
        toast.error("Error al cargar la lista de accesos disponibles");
      }

      // Intentar cargar la lista de asignaciones actuales (puede fallar si no hay ninguna)
      try {
        const resList = await getEmpleadoDispositivo(empleado.empleado_id);
        setListado(Array.isArray(resList) ? resList : (resList?.data || []));
      } catch (err) {
        console.log("No se encontraron asignaciones previas o error al cargar lista:", err);
        setListado([]);
      }
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    if (empleado) {
      fetchData();
    }
  }, [empleado]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.dispositivo_id) {
      toast.error("Debe seleccionar un acceso");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Asignando acceso...");

    try {
      const payload = {
        empleado_id: empleado.empleado_id,
        dispositivo_id: parseInt(formData.dispositivo_id),
        fecha_entrada: formData.fecha_entrada,
        fecha_salida: formData.fecha_salida,
        hora_entrada: formData.hora_entrada.includes(':') && formData.hora_entrada.split(':').length === 2 ? `${formData.hora_entrada}:00` : formData.hora_entrada,
        hora_salida: formData.hora_salida.includes(':') && formData.hora_salida.split(':').length === 2 ? `${formData.hora_salida}:00` : formData.hora_salida
      };

      await createEmpleadoDispositivo(payload);
      toast.success("Asignación creada exitosamente", { id: toastId });

      // Reset form but keep dates
      setFormData(prev => ({ ...prev, dispositivo_id: "" }));
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error al crear la asignación", { id: toastId });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta asignación?")) return;

    const toastId = toast.loading("Eliminando...");
    try {
      await deleteEmpleadoDispositivo(id);
      toast.success("Eliminado correctamente", { id: toastId });
      fetchData();
    } catch (error) {
      toast.error("Error al eliminar", { id: toastId });
    }
  };

  return (
    <Stack gap={6}>
      <Box p={4} borderWidth="1px" borderRadius="md" bg="gray.50">
        <Text fontWeight="bold" mb={4} fontSize="sm">Nueva Asignación Especial</Text>
        <form onSubmit={handleSubmit}>
          <Grid templateColumns={{ base: "1fr", md: "1fr 1fr 1fr" }} gap={4}>
            <Field.Root required>
              <Field.Label fontSize="xs">Acceso</Field.Label>
              <Box
                as="select"
                name="dispositivo_id"
                value={formData.dispositivo_id}
                onChange={handleChange}
                w="full"
                p={2}
                bg="white"
                borderWidth="1px"
                borderColor="gray.200"
                borderRadius="md"
                fontSize="sm"
              >
                <option value="">Seleccionar...</option>
                {dispositivos.map(d => (
                  <option key={d.dispositivo_id} value={d.dispositivo_id}>{d.nombre}</option>
                ))}
              </Box>
            </Field.Root>

            <Field.Root required>
              <Field.Label fontSize="xs">Fecha Entrada</Field.Label>
              <Input size="sm" type="date" name="fecha_entrada" value={formData.fecha_entrada} onChange={handleChange} bg="white" />
            </Field.Root>

            <Field.Root required>
              <Field.Label fontSize="xs">Fecha Salida</Field.Label>
              <Input size="sm" type="date" name="fecha_salida" value={formData.fecha_salida} onChange={handleChange} bg="white" />
            </Field.Root>

            <Field.Root required>
              <Field.Label fontSize="xs">Hora Entrada</Field.Label>
              <Input size="sm" type="time" name="hora_entrada" value={formData.hora_entrada} onChange={handleChange} bg="white" />
            </Field.Root>

            <Field.Root required>
              <Field.Label fontSize="xs">Hora Salida</Field.Label>
              <Input size="sm" type="time" name="hora_salida" value={formData.hora_salida} onChange={handleChange} bg="white" />
            </Field.Root>

            <Flex align="flex-end">
              <Button type="submit" colorScheme="blue" bg="#eaaa00" color="white" _hover={{ bg: "#cca000" }} width="full" loading={loading}>
                <LuPlus /> Asignar
              </Button>
            </Flex>
          </Grid>
        </form>
      </Box>

      <Box>
        <Text fontWeight="bold" mb={4} fontSize="sm">Asignaciones Actuales</Text>
        <Box maxHeight="300px" overflowY="auto" borderWidth="1px" borderRadius="md">
          <Table.Root size="sm" variant="outline">
            <Table.Header>
              <Table.Row bg="gray.50">
                <Table.ColumnHeader>Acceso</Table.ColumnHeader>
                <Table.ColumnHeader>Desde</Table.ColumnHeader>
                <Table.ColumnHeader>Hasta</Table.ColumnHeader>
                <Table.ColumnHeader textAlign="center">Acción</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {listado.length === 0 ? (
                <Table.Row>
                  <Table.Cell colSpan={4} textAlign="center" py={4} color="gray.500">
                    No hay asignaciones especiales
                  </Table.Cell>
                </Table.Row>
              ) : (
                listado.map((item) => (
                  <Table.Row key={item.id}>
                    <Table.Cell>{item.dispositivo_id?.nombre || item.dispositivo_id}</Table.Cell>
                    <Table.Cell>
                      {item.fecha_entrada?.split('T')[0] || "-"} {item.hora_entrada}
                    </Table.Cell>
                    <Table.Cell>
                      {item.fecha_salida?.split('T')[0] || "-"} {item.hora_salida}
                    </Table.Cell>
                    <Table.Cell textAlign="center">
                      <IconButton
                        size="xs"
                        variant="ghost"
                        colorPalette="red"
                        onClick={() => handleDelete(item.id)}
                      >
                        <LuTrash2 />
                      </IconButton>
                    </Table.Cell>
                  </Table.Row>
                ))
              )}
            </Table.Body>
          </Table.Root>
        </Box>
      </Box>

      <Flex justify="flex-end">
        <Button onClick={onCancel}>Cerrar</Button>
      </Flex>
    </Stack>
  );
}
