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
import createDispositivoService from "../services/createDispositivoService";

export default function CreateAcceso({ onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    nombre: "",
    ubicacion: "",
    comuna: "",
    modelo: "",
    fabricante: "",
    version_firmware: "",
    direccion_ip: "",
    gateway: "",
    dns: "",
    estado: "1"
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nombre.trim()) {
      toast.error("El nombre del acceso es requerido");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Creando acceso...");

    try {
      const payload = {
        ...formData,
        estado: parseInt(formData.estado, 10)
      };

      await createDispositivoService(payload);

      toast.success("Acceso creado exitosamente", { id: toastId });
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error al crear el acceso", { id: toastId });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
        <Field.Root required>
          <Field.Label>Nombre</Field.Label>
          <Input name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Ej: Acceso 1" />
        </Field.Root>

        <Field.Root>
          <Field.Label>Ubicación</Field.Label>
          <Input name="ubicacion" value={formData.ubicacion} onChange={handleChange} placeholder="Ej: Planta 1" />
        </Field.Root>

        <Field.Root>
          <Field.Label>Comuna</Field.Label>
          <Input name="comuna" value={formData.comuna} onChange={handleChange} placeholder="Ej: Maipú" />
        </Field.Root>

        <Field.Root>
          <Field.Label>Fabricante</Field.Label>
          <Input name="fabricante" value={formData.fabricante} onChange={handleChange} placeholder="Ej: Femase" />
        </Field.Root>

        <Field.Root>
          <Field.Label>Modelo</Field.Label>
          <Input name="modelo" value={formData.modelo} onChange={handleChange} placeholder="Ej: 3" />
        </Field.Root>

        <Field.Root>
          <Field.Label>Versión Firmware</Field.Label>
          <Input name="version_firmware" value={formData.version_firmware} onChange={handleChange} placeholder="Ej: 2.1.0" />
        </Field.Root>

        <Field.Root>
          <Field.Label>Dirección IP</Field.Label>
          <Input name="direccion_ip" value={formData.direccion_ip} onChange={handleChange} placeholder="Ej: 192.168.1.10" />
        </Field.Root>

        <Field.Root>
          <Field.Label>Gateway</Field.Label>
          <Input name="gateway" value={formData.gateway} onChange={handleChange} placeholder="Ej: 192.168.1.1" />
        </Field.Root>

        <Field.Root>
          <Field.Label>DNS</Field.Label>
          <Input name="dns" value={formData.dns} onChange={handleChange} placeholder="Ej: 8.8.8.8" />
        </Field.Root>

        <Field.Root required>
          <Field.Label>Estado</Field.Label>
          <Box 
            as="select" 
            name="estado"
            value={formData.estado} 
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
          Crear Acceso
        </Button>
      </Flex>
    </Box>
  );
}
