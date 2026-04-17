import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Flex,
  Text,
  Stack,
  IconButton
} from "@chakra-ui/react";
import { LuChevronRight, LuChevronLeft, LuChevronsRight, LuChevronsLeft } from "react-icons/lu";
import toast from "react-hot-toast";
import getDispositivos from "../services/getDispositivos";
import getDispositivosPorCargoService from "../services/getDispositivosPorCargoService";
import assignDispositivosCargoService from "../services/assignDispositivosCargoService";

export default function AsignarAccesosCargo({ cargo, onSuccess, onCancel }) {
  const [disponibles, setDisponibles] = useState([]);
  const [asignados, setAsignados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [seleccionDisponible, setSeleccionDisponible] = useState(null);
  const [seleccionAsignado, setSeleccionAsignado] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allDispositivos, assignedData] = await Promise.all([
          getDispositivos(),
          getDispositivosPorCargoService(cargo.cargo_id).catch(() => ({ dispositivos: [] }))
        ]);
        
        const all = Array.isArray(allDispositivos) ? allDispositivos : (allDispositivos?.data || []);
        // Extract array since the structure is { cargo_id: {...}, dispositivos: [...] }
        const assignedArray = Array.isArray(assignedData) ? assignedData : (assignedData?.dispositivos || []);

        const assignedIds = new Set(assignedArray.map(d => d.dispositivo_id));

        const filteredDisponibles = all.filter(d => !assignedIds.has(d.dispositivo_id));

        setDisponibles(filteredDisponibles);
        setAsignados(assignedArray);
      } catch (error) {
        toast.error("Error al cargar los accesos");
      }
    };
    fetchData();
  }, [cargo.cargo_id]);

  const moveRight = () => {
    if (!seleccionDisponible) return;
    const item = disponibles.find(d => d.dispositivo_id === seleccionDisponible);
    if (item) {
      setDisponibles(prev => prev.filter(d => d.dispositivo_id !== item.dispositivo_id));
      setAsignados(prev => [...prev, item]);
      setSeleccionDisponible(null);
    }
  };

  const moveLeft = () => {
    if (!seleccionAsignado) return;
    const item = asignados.find(d => d.dispositivo_id === seleccionAsignado);
    if (item) {
      setAsignados(prev => prev.filter(d => d.dispositivo_id !== item.dispositivo_id));
      setDisponibles(prev => [...prev, item]);
      setSeleccionAsignado(null);
    }
  };

  const moveAllRight = () => {
    if (disponibles.length === 0) return;
    setAsignados(prev => [...prev, ...disponibles]);
    setDisponibles([]);
    setSeleccionDisponible(null);
  };

  const moveAllLeft = () => {
    if (asignados.length === 0) return;
    setDisponibles(prev => [...prev, ...asignados]);
    setAsignados([]);
    setSeleccionAsignado(null);
  };

  const handleSubmit = async () => {
    setLoading(true);
    const toastId = toast.loading("Asignando accesos...");

    try {
      const payload = {
        cargo_id: cargo.cargo_id,
        dispositivos_ids: asignados.map(a => a.dispositivo_id)
      };

      await assignDispositivosCargoService(payload);

      toast.success("Accesos asignados exitosamente", { id: toastId });
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error al asignar accesos", { id: toastId });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Text mb={4} fontWeight="semibold" color="gray.600">
        Accesos para el cargo: {cargo.nombre}
      </Text>

      <Flex gap={4} align="center" justify="center" direction={{ base: "column", md: "row" }}>
        
        {/* Accesos Disponibles */}
        <Box flex={1} w="full" borderWidth="1px" borderRadius="md" borderColor="gray.200" bg="white">
          <Box bg="gray.50" p={2} borderBottomWidth="1px" borderColor="gray.200">
            <Text fontWeight="bold" fontSize="sm" textAlign="center">Accesos Disponibles</Text>
          </Box>
          <Box h="300px" overflowY="auto" p={2}>
            {disponibles.length === 0 ? (
              <Text fontSize="sm" color="gray.400" textAlign="center" mt={4}>No hay accesos disponibles</Text>
            ) : (
              <Stack gap={1}>
                {disponibles.map(d => (
                  <Box
                    key={d.dispositivo_id}
                    p={2}
                    bg={seleccionDisponible === d.dispositivo_id ? "blue.50" : "white"}
                    borderWidth="1px"
                    borderColor={seleccionDisponible === d.dispositivo_id ? "blue.400" : "gray.200"}
                    borderRadius="md"
                    cursor="pointer"
                    _hover={{ bg: "gray.50" }}
                    onClick={() => setSeleccionDisponible(d.dispositivo_id)}
                  >
                    <Text fontSize="sm" fontWeight="medium">{d.nombre}</Text>
                    <Text fontSize="xs" color="gray.500">{d.ubicacion} (IP: {d.direccion_ip})</Text>
                  </Box>
                ))}
              </Stack>
            )}
          </Box>
        </Box>

        {/* Action Buttons */}
        <Flex direction={{ base: "row", md: "column" }} gap={2}>
          <IconButton 
            colorScheme="blue" 
            variant="outline"
            aria-label="Asignar Todos"
            disabled={disponibles.length === 0}
            onClick={moveAllRight}
          >
            <LuChevronsRight />
          </IconButton>
          <IconButton 
            colorScheme="blue" 
            aria-label="Asignar"
            disabled={!seleccionDisponible}
            onClick={moveRight}
          >
            <LuChevronRight />
          </IconButton>
          <IconButton 
            colorScheme="red" 
            aria-label="Quitar"
            disabled={!seleccionAsignado}
            onClick={moveLeft}
          >
            <LuChevronLeft />
          </IconButton>
          <IconButton 
            colorScheme="red" 
            variant="outline"
            aria-label="Quitar Todos"
            disabled={asignados.length === 0}
            onClick={moveAllLeft}
          >
            <LuChevronsLeft />
          </IconButton>
        </Flex>

        {/* Accesos Asignados */}
        <Box flex={1} w="full" borderWidth="1px" borderRadius="md" borderColor="gray.200" bg="white">
          <Box bg="green.50" p={2} borderBottomWidth="1px" borderColor="green.200">
            <Text fontWeight="bold" fontSize="sm" textAlign="center" color="green.700">Accesos Asignados</Text>
          </Box>
          <Box h="300px" overflowY="auto" p={2}>
            {asignados.length === 0 ? (
              <Text fontSize="sm" color="gray.400" textAlign="center" mt={4}>No hay accesos asignados</Text>
            ) : (
              <Stack gap={1}>
                {asignados.map(d => (
                  <Box
                    key={d.dispositivo_id}
                    p={2}
                    bg={seleccionAsignado === d.dispositivo_id ? "green.100" : "white"}
                    borderWidth="1px"
                    borderColor={seleccionAsignado === d.dispositivo_id ? "green.400" : "gray.200"}
                    borderRadius="md"
                    cursor="pointer"
                    _hover={{ bg: "gray.50" }}
                    onClick={() => setSeleccionAsignado(d.dispositivo_id)}
                  >
                    <Text fontSize="sm" fontWeight="medium">{d.nombre}</Text>
                    <Text fontSize="xs" color="gray.500">{d.ubicacion} (IP: {d.direccion_ip})</Text>
                  </Box>
                ))}
              </Stack>
            )}
          </Box>
        </Box>

      </Flex>

      <Flex justify="flex-end" gap={3} mt={6}>
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button colorScheme="blue" bg="#eaaa00" color="white" _hover={{ bg: "#cca000" }} onClick={handleSubmit} loading={loading}>
          Guardar Asignaciones
        </Button>
      </Flex>
    </Box>
  );
}
