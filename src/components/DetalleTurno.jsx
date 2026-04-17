import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Flex,
  Table,
  Text,
} from "@chakra-ui/react";
import toast from "react-hot-toast";
import getHorarios from "../services/getHorarios";
import getDetalleTurno from "../services/getDetalleTurno";
import createAsignacionTurnoService from "../services/createAsignacionTurnoService";

const DIAS_SEMANA = [
  { cod_dia: 1, nombre: "Lunes" },
  { cod_dia: 2, nombre: "Martes" },
  { cod_dia: 3, nombre: "Miércoles" },
  { cod_dia: 4, nombre: "Jueves" },
  { cod_dia: 5, nombre: "Viernes" },
  { cod_dia: 6, nombre: "Sábado" },
  { cod_dia: 7, nombre: "Domingo" }
];

export default function DetalleTurno({ turno, onSuccess, onCancel }) {
  const [horarios, setHorarios] = useState([]);
  const [asignaciones, setAsignaciones] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [horariosRes, detalleRes] = await Promise.all([
          getHorarios(),
          // catch the 404 error if there are no assignations to ensure it doesn't break
          getDetalleTurno(turno.turno_id).catch(() => ({ data: [] }))
        ]);

        const dataHorarios = Array.isArray(horariosRes) ? horariosRes : (horariosRes?.data || []);
        const dataDetalles = Array.isArray(detalleRes) ? detalleRes : (detalleRes?.data || []);

        setHorarios(dataHorarios);

        const initialAsignaciones = {};
        if (Array.isArray(dataDetalles)) {
          dataDetalles.forEach(d => {
            // handle both cases: relations expanded { horario_id: 2 } or flat { horario_id: 2 } 
            const hId = typeof d.horario_id === 'object' && d.horario_id !== null
              ? d.horario_id.horario_id
              : d.horario_id;

            initialAsignaciones[d.cod_dia] = hId;
          });
        }
        setAsignaciones(initialAsignaciones);
      } catch (error) {
        toast.error("Error al cargar los datos del turno");
      }
    };
    fetchData();
  }, [turno.turno_id]);

  const handleSelectChange = (cod_dia, horario_id) => {
    setAsignaciones(prev => ({
      ...prev,
      [cod_dia]: horario_id
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Extraer solo los días que tienen un horario asignado
    const cod_dia = [];
    const horario_id = [];

    DIAS_SEMANA.forEach(dia => {
      const h_id = asignaciones[dia.cod_dia];
      if (h_id && h_id !== "none") {
        cod_dia.push(dia.cod_dia);
        horario_id.push(parseInt(h_id, 10));
      }
    });

    if (cod_dia.length === 0) {
      toast.error("Debe asignar al menos un horario");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Asignando horarios...");

    try {
      const payload = {
        turno_id: turno.turno_id,
        cod_dia,
        horario_id
      };

      await createAsignacionTurnoService(payload);

      toast.success("Horarios asignados exitosamente al turno", { id: toastId });
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error al asignar horarios", { id: toastId });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <Text mb={4} fontWeight="semibold" color="gray.600">
        Asignar horarios para: {turno.nombre}
      </Text>

      <Table.Root variant="outline" size="sm" width="full">
        <Table.Header>
          <Table.Row bg="gray.50">
            <Table.ColumnHeader>Día</Table.ColumnHeader>
            <Table.ColumnHeader>Horario Asignado</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {DIAS_SEMANA.map((dia) => (
            <Table.Row key={dia.cod_dia}>
              <Table.Cell>{dia.nombre}</Table.Cell>
              <Table.Cell>
                <Box
                  as="select"
                  value={asignaciones[dia.cod_dia] || "none"}
                  onChange={(e) => handleSelectChange(dia.cod_dia, e.target.value)}
                  w="full"
                  p={1}
                  borderWidth="1px"
                  borderColor="gray.200"
                  borderRadius="md"
                  outline="none"
                  _focus={{ borderColor: "blue.500", boxShadow: "outline" }}
                  bg="white"
                >
                  <option value="none">Sin asignación (Día libre)</option>
                  {horarios.map((h) => (
                    <option key={h.horario_id} value={h.horario_id}>
                      {`ID ${h.horario_id}: ${h.hora_entrada} a ${h.hora_salida}`}
                    </option>
                  ))}
                </Box>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>

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
