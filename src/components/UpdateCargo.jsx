import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Field,
  Flex,
  Input
} from "@chakra-ui/react";
import toast from "react-hot-toast";
import updateCargoService from "../services/updateCargoService";

export default function UpdateCargo({ cargo, onSuccess, onCancel }) {
  const [nombre, setNombre] = useState(cargo.nombre || "");
  const [estado, setEstado] = useState(String(cargo.estado ?? "1"));
  const [tipoCargo, setTipoCargo] = useState(String(cargo.tipo_cargo ?? "1"));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cargo) {
        setNombre(cargo.nombre || "");
        setEstado(String(cargo.estado ?? "1"));
        setTipoCargo(String(cargo.tipo_cargo ?? "1"));
    }
  }, [cargo]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nombre.trim()) {
      toast.error("El nombre del cargo es requerido");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Actualizando cargo...");

    try {
      const payload = {
        nombre: nombre.trim(),
        estado: parseInt(estado, 10),
        tipo_cargo: parseInt(tipoCargo, 10)
      };

      await updateCargoService(cargo.cargo_id, payload);

      toast.success("Cargo actualizado exitosamente", { id: toastId });
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error al actualizar el cargo", { id: toastId });
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
            Guardar Cambios
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
}
