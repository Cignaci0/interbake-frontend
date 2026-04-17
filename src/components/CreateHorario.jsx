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
import createHorarioService from "../services/createHorarioService";

export default function CreateHorario({ onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    hora_entrada: "09:00:00",
    hora_salida: "18:00:00",
    holgura_mins: "00:05:00"
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // value from a time input with step="2" is already HH:MM:SS
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.hora_entrada || !formData.hora_salida) {
      toast.error("La hora de entrada y salida son obligatorias");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Creando horario...");

    try {
      await createHorarioService(formData);

      toast.success("Horario creado exitosamente", { id: toastId });
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error al crear el horario", { id: toastId });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
        <Field.Root required>
          <Field.Label>Hora de Entrada</Field.Label>
          <Input 
            type="time" 
            step="1" 
            name="hora_entrada" 
            value={formData.hora_entrada} 
            onChange={handleChange} 
          />
        </Field.Root>

        <Field.Root required>
          <Field.Label>Hora de Salida</Field.Label>
          <Input 
            type="time" 
            step="1" 
            name="hora_salida" 
            value={formData.hora_salida} 
            onChange={handleChange} 
          />
        </Field.Root>

        <Field.Root required>
          <Field.Label>Holgura (HH:MM:SS)</Field.Label>
          <Input 
            type="text" 
            name="holgura_mins" 
            value={formData.holgura_mins} 
            onChange={handleChange} 
            placeholder="00:05:00"
          />
        </Field.Root>
      </Grid>
      
      <Flex justify="flex-end" gap={3} mt={6}>
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" colorScheme="blue" bg="#eaaa00" color="white" _hover={{ bg: "#cca000" }} loading={loading}>
          Crear Horario
        </Button>
      </Flex>
    </Box>
  );
}
