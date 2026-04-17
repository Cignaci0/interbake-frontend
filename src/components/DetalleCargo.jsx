import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Flex,
  Table,
  Text
} from "@chakra-ui/react";
import toast from "react-hot-toast";
import getDispositivos from "../services/getDispositivos";
import getCargoDispositivos from "../services/getCargoDispositivos";
import createAsignacionCargoDispositivos from "../services/createAsignacionCargoDispositivos";

export default function DetalleCargo({ cargo, onSuccess, onCancel }) {
  const [accesos, setAccesos] = useState([]);
  const [asignaciones, setAsignaciones] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dispositivosRes, detalleRes] = await Promise.all([
          getDispositivos(),
          getCargoDispositivos(cargo.cargo_id).catch(() => ({ dispositivos: [] }))
        ]);
        
        setAccesos(dispositivosRes || []);

        const initialAsignaciones = [];
        if (detalleRes && Array.isArray(detalleRes.dispositivos)) {
          detalleRes.dispositivos.forEach(d => {
            const dId = typeof d === 'object' && d !== null ? d.dispositivo_id : d;
            initialAsignaciones.push(dId);
          });
        }
        setAsignaciones(initialAsignaciones);
      } catch (error) {
        toast.error("Error al cargar los datos del cargo");
      }
    };
    fetchData();
  }, [cargo.cargo_id]);

  const handleCheckboxChange = (accesoId, isChecked) => {
    if (isChecked) {
      setAsignaciones(prev => [...prev, accesoId]);
    } else {
      setAsignaciones(prev => prev.filter(id => id !== accesoId));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    const toastId = toast.loading("Asignando accesos...");

    try {
      const payload = {
        cargo_id: cargo.cargo_id,
        dispositivos_ids: asignaciones
      };

      await createAsignacionCargoDispositivos(payload);

      toast.success("Accesos asignados exitosamente al cargo", { id: toastId });
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error al asignar accesos", { id: toastId });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <Text mb={4} fontWeight="semibold" color="gray.600">
        Asignar accesos para cargo: {cargo.nombre}
      </Text>

      <Box maxH="400px" overflowY="auto">
        <Table.Root variant="outline" size="sm" width="full">
          <Table.Header>
            <Table.Row bg="gray.50">
              <Table.ColumnHeader w="50px">Asignar</Table.ColumnHeader>
              <Table.ColumnHeader>Acceso</Table.ColumnHeader>
              <Table.ColumnHeader>Ubicación</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {accesos.length > 0 ? (
              accesos.map((d) => (
                <Table.Row key={d.dispositivo_id}>
                  <Table.Cell>
                    <input
                      type="checkbox"
                      checked={asignaciones.includes(d.dispositivo_id)}
                      onChange={(e) => handleCheckboxChange(d.dispositivo_id, e.target.checked)}
                      style={{ cursor: 'pointer', transform: 'scale(1.2)' }}
                    />
                  </Table.Cell>
                  <Table.Cell>{d.nombre}</Table.Cell>
                  <Table.Cell>{d.ubicacion}</Table.Cell>
                </Table.Row>
              ))
            ) : (
              <Table.Row>
                <Table.Cell colSpan={3} textAlign="center" color="gray.500">No hay accesos disponibles</Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table.Root>
      </Box>

      <Flex justify="flex-end" gap={3} mt={6}>
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" colorScheme="blue" bg="#eaaa00" color="white" _hover={{ bg: "#cca000" }} loading={loading}>
          Guardar Asignación
        </Button>
      </Flex>
    </Box>
  );
}
