import { useState } from "react";
import {
  Box,
  Button,
  createListCollection,
  Field,
  Flex,
  Input,
} from "@chakra-ui/react";
import toast from "react-hot-toast";
import createCargoService from "../services/createCargoService";

export default function CreateCargo({ onSuccess, onCancel }) {
  const [nombre, setNombre] = useState("");
  const [estado, setEstado] = useState("1"); // Default to activo (1)
  const [tipoCargo, setTipoCargo] = useState("1"); // Default to Producción (1)
  const [loading, setLoading] = useState(false);

  const estados = createListCollection({
    items: [
      { label: 'Activo', value: '1' },
      { label: 'Inactivo', value: '0' }
    ]
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nombre.trim()) {
      toast.error("El nombre del cargo es requerido");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Creando cargo...");

    try {
      const payload = {
        nombre: nombre.trim(),
        estado: parseInt(estado, 10),
        tipo_cargo: parseInt(tipoCargo, 10)
      };

      await createCargoService(payload);

      toast.success("Cargo creado exitosamente", { id: toastId });
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error al crear el cargo", { id: toastId });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <Flex direction="column" gap={4}>
        <Field.Root required>
          <Field.Label>Nombre del Cargo</Field.Label>
          <Input
            type="text"
            placeholder="Ej: RR.HH"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </Field.Root>

        <Field.Root required>
          <Field.Label>Estado</Field.Label>
          <Box
            as="select"
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
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

        <Field.Root required>
          <Field.Label>Tipo de Cargo</Field.Label>
          <Box
            as="select"
            value={tipoCargo}
            onChange={(e) => setTipoCargo(e.target.value)}
            w="full"
            p={2}
            borderWidth="1px"
            borderColor="gray.200"
            borderRadius="md"
            outline="none"
            _focus={{ borderColor: "blue.500", boxShadow: "outline" }}
          >
            <option value="1">Producción</option>
            <option value="2">Administración</option>
            <option value="3">Jefatura</option>
          </Box>
        </Field.Root>

        <Flex justify="flex-end" gap={3} mt={4}>
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" colorScheme="blue" bg="#eaaa00" color="white" _hover={{ bg: "#cca000" }} loading={loading}>
            Crear Cargo
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
}
