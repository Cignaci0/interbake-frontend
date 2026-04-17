import { useState } from "react";
import {
  Box,
  Button,
  Field,
  Flex,
  Input,
  Grid
} from "@chakra-ui/react";
import toast from "react-hot-toast";
import createTurnoService from "../services/createTurnoService";

export default function CreateTurno({ onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    nombre: "",
    estado_id: "1" // Default to Activo (1)
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nombre.trim()) {
      toast.error("El nombre del turno es requerido");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Creando turno...");

    try {
      const payload = {
        nombre: formData.nombre.trim(),
        estado_id: parseInt(formData.estado_id, 10)
      };

      await createTurnoService(payload);

      toast.success("Turno creado exitosamente", { id: toastId });
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error al crear el turno", { id: toastId });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <Grid templateColumns={{ base: "1fr" }} gap={4}>
        <Field.Root required>
          <Field.Label>Nombre</Field.Label>
          <Input 
            name="nombre" 
            value={formData.nombre} 
            onChange={handleChange} 
            placeholder="Ej: Turno Mañana" 
          />
        </Field.Root>

        <Field.Root required>
          <Field.Label>Estado</Field.Label>
          <Box 
            as="select" 
            name="estado_id"
            value={formData.estado_id} 
            onChange={handleChange}
            w="full"
            p={2}
            borderWidth="1px"
            borderColor="gray.200"
            borderRadius="md"
            outline="none"
            _focus={{ borderColor: "blue.500", boxShadow: "outline" }}
          >
            <option value="1">Activo</option>
            <option value="0">Inactivo</option>
          </Box>
        </Field.Root>
      </Grid>
      
      <Flex justify="flex-end" gap={3} mt={6}>
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" colorScheme="blue" bg="#eaaa00" color="white" _hover={{ bg: "#cca000" }} loading={loading}>
          Crear Turno
        </Button>
      </Flex>
    </Box>
  );
}
