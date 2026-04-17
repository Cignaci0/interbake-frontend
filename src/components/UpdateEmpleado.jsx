import { 
  Box, 
  Button, 
  Field, 
  Flex, 
  Grid, 
  Input, 
  Select, 
  Stack, 
  Switch, 
  createListCollection,
  Portal,
  Text 
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import updateEmpleado from "../services/updateEmpleado";
import getCargos from "../services/getCargos";
import getCencos from "../services/getCencos";

export default function UpdateEmpleado({ empleado, onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [cargos, setCargos] = useState([]);
  const [cencos, setCencos] = useState([]);

  const formatISOToDateInput = (isoString) => {
    if (!isoString) return "";
    return isoString.split("T")[0];
  };

  const [formData, setFormData] = useState({
    nombres: empleado?.nombres || "",
    apellido_paterno: empleado?.apellido_paterno || "",
    apellido_materno: empleado?.apellido_materno || "",
    run: empleado?.run || "",
    num_ficha: empleado?.num_ficha || "",
    fecha_nacimiento: formatISOToDateInput(empleado?.fecha_nacimiento),
    sexo: empleado?.sexo || "M",
    direccion: empleado?.direccion || "",
    comuna: empleado?.comuna || "",
    telefono_fijo: empleado?.telefono_fijo || 0,
    telefono_movil: empleado?.telefono_movil || null,
    email: empleado?.email || "",
    email_laboral: empleado?.email_laboral || "",
    email_noti: empleado?.email_noti || "",
    cargo_id: empleado?.cargo_id?.cargo_id?.toString() || "",
    cenco_id: empleado?.cenco_id?.cenco_id?.toString() || "",
    fecha_ini_contrato: formatISOToDateInput(empleado?.fecha_ini_contrato),
    fecha_fin_contrato: formatISOToDateInput(empleado?.fecha_fin_contrato),
    contrato_indefinido: empleado?.contrato_indefinido ?? true,
    art_22: empleado?.art_22 ?? false,
    clave: empleado?.clave || "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resCargos, resCencos] = await Promise.all([getCargos(), getCencos()]);
        
        const dataCargos = Array.isArray(resCargos) ? resCargos : (resCargos?.data || []);
        const dataCencos = Array.isArray(resCencos) ? resCencos : (resCencos?.data || []);

        setCargos(dataCargos);
        setCencos(dataCencos);
      } catch (error) {
        console.error("Error al cargar cargos/cencos", error);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSwitchChange = (name, checked) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading("Actualizando empleado...");
    try {
      const payload = {
        ...formData,
        fecha_fin_contrato: formData.contrato_indefinido ? "3000-12-31" : formData.fecha_fin_contrato,
        cargo_id: { cargo_id: parseInt(formData.cargo_id) },
        cenco_id: { cenco_id: parseInt(formData.cenco_id) },
        telefono_fijo: parseInt(formData.telefono_fijo) || 0,
        telefono_movil: formData.telefono_movil ? parseInt(formData.telefono_movil) : null,
      };

      await updateEmpleado(empleado.empleado_id, payload);
      toast.success("Empleado actualizado correctamente", { id: toastId });
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error al actualizar empleado", { id: toastId });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const collectionCargos = createListCollection({
    items: cargos.map(c => ({ label: c.nombre, value: c.cargo_id.toString() }))
  });

  const collectionCencos = createListCollection({
    items: cencos.map(c => ({ label: c.nombre, value: c.cenco_id.toString() }))
  });

  const collectionSexo = createListCollection({
    items: [
      { label: "Masculino", value: "M" },
      { label: "Femenino", value: "F" },
      { label: "Otro", value: "O" }
    ]
  });

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap={6}>
        <Box>
          <Text fontWeight="bold" mb={4} color="blue.600" borderBottom="1px solid" borderColor="blue.100">Datos Personales</Text>
          <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4}>
            <Field.Root required>
              <Field.Label>RUT</Field.Label>
              <Input name="run" value={formData.run} onChange={handleChange} />
            </Field.Root>
            <Field.Root required>
              <Field.Label>Nombres</Field.Label>
              <Input name="nombres" value={formData.nombres} onChange={handleChange} />
            </Field.Root>
            <Field.Root required>
              <Field.Label>Ape. Paterno</Field.Label>
              <Input name="apellido_paterno" value={formData.apellido_paterno} onChange={handleChange} />
            </Field.Root>
            <Field.Root>
              <Field.Label>Ape. Materno</Field.Label>
              <Input name="apellido_materno" value={formData.apellido_materno} onChange={handleChange} />
            </Field.Root>
            <Field.Root required>
              <Field.Label>F. Nacimiento</Field.Label>
              <Input type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleChange} />
            </Field.Root>
            <Field.Root required>
              <Field.Label>Sexo</Field.Label>
              <Select.Root 
                collection={collectionSexo} 
                onValueChange={(d) => setFormData(p => ({...p, sexo: d.value[0]}))}
                value={[formData.sexo]}
              >
                <Select.Control><Select.Trigger><Select.ValueText /></Select.Trigger></Select.Control>
                <Portal><Select.Positioner><Select.Content>
                  {collectionSexo.items.map(i => <Select.Item item={i} key={i.value}>{i.label}</Select.Item>)}
                </Select.Content></Select.Positioner></Portal>
              </Select.Root>
            </Field.Root>
          </Grid>
          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4} mt={4}>
            <Field.Root required>
              <Field.Label>Dirección</Field.Label>
              <Input name="direccion" value={formData.direccion} onChange={handleChange} />
            </Field.Root>
            <Field.Root required>
              <Field.Label>Comuna</Field.Label>
              <Input name="comuna" value={formData.comuna} onChange={handleChange} />
            </Field.Root>
          </Grid>
        </Box>

        <Box>
          <Text fontWeight="bold" mb={4} color="green.600" borderBottom="1px solid" borderColor="green.100">Datos Laborales</Text>
          <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4}>
            <Field.Root required>
              <Field.Label>Num Ficha</Field.Label>
              <Input name="num_ficha" value={formData.num_ficha} onChange={handleChange} />
            </Field.Root>
            <Field.Root required>
              <Field.Label>Cargo</Field.Label>
              <Select.Root 
                collection={collectionCargos} 
                onValueChange={(d) => setFormData(p => ({...p, cargo_id: d.value[0]}))}
                value={formData.cargo_id ? [formData.cargo_id] : []}
              >
                <Select.Control><Select.Trigger><Select.ValueText placeholder="Seleccione..." /></Select.Trigger></Select.Control>
                <Portal><Select.Positioner><Select.Content>
                  {collectionCargos.items.map(i => <Select.Item item={i} key={i.value}>{i.label}</Select.Item>)}
                </Select.Content></Select.Positioner></Portal>
              </Select.Root>
            </Field.Root>
            <Field.Root required>
              <Field.Label>Centro de Costo</Field.Label>
              <Select.Root 
                collection={collectionCencos} 
                onValueChange={(d) => setFormData(p => ({...p, cenco_id: d.value[0]}))}
                value={formData.cenco_id ? [formData.cenco_id] : []}
              >
                <Select.Control><Select.Trigger><Select.ValueText placeholder="Seleccione..." /></Select.Trigger></Select.Control>
                <Portal><Select.Positioner><Select.Content>
                  {collectionCencos.items.map(i => <Select.Item item={i} key={i.value}>{i.label}</Select.Item>)}
                </Select.Content></Select.Positioner></Portal>
              </Select.Root>
            </Field.Root>
            <Field.Root required>
              <Field.Label>F. Inicio Contrato</Field.Label>
              <Input type="date" name="fecha_ini_contrato" value={formData.fecha_ini_contrato} onChange={handleChange} />
            </Field.Root>
            {!formData.contrato_indefinido && (
              <Field.Root required>
                <Field.Label>F. Fin Contrato</Field.Label>
                <Input type="date" name="fecha_fin_contrato" value={formData.fecha_fin_contrato} onChange={handleChange} />
              </Field.Root>
            )}
          </Grid>
          
          <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={6} mt={6}>
            <Flex align="center" gap={4}>
              <Switch.Root 
                checked={Boolean(formData.contrato_indefinido)} 
                onCheckedChange={({ checked }) => handleSwitchChange("contrato_indefinido", checked)}
                colorPalette="teal"
              >
                <Switch.HiddenInput />
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
                <Switch.Label cursor="pointer">Contrato Indefinido</Switch.Label>
              </Switch.Root>
            </Flex>
            <Flex align="center" gap={4}>
              <Switch.Root 
                checked={Boolean(formData.art_22)} 
                onCheckedChange={({ checked }) => handleSwitchChange("art_22", checked)}
                colorPalette="orange"
              >
                <Switch.HiddenInput />
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
                <Switch.Label cursor="pointer">Art. 22</Switch.Label>
              </Switch.Root>
            </Flex>
          </Grid>
        </Box>

        <Box>
          <Text fontWeight="bold" mb={4} color="purple.600" borderBottom="1px solid" borderColor="purple.100">Contacto y Emails</Text>
          <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4}>
            <Field.Root required>
              <Field.Label>Email Personal</Field.Label>
              <Input type="email" name="email" value={formData.email} onChange={handleChange} />
            </Field.Root>
            <Field.Root>
              <Field.Label>Email Laboral</Field.Label>
              <Input type="email" name="email_laboral" value={formData.email_laboral} onChange={handleChange} />
            </Field.Root>
            <Field.Root>
              <Field.Label>Email Noti</Field.Label>
              <Input type="email" name="email_noti" value={formData.email_noti} onChange={handleChange} />
            </Field.Root>
          </Grid>
        </Box>

        <Flex justify="flex-end" gap={3} mt={4}>
          <Button variant="ghost" onClick={onCancel} disabled={loading}>Cancelar</Button>
          <Button type="submit" bg="#7d001c" color="white" _hover={{ bg: "#9a0022" }} loading={loading}>
            Guardar Cambios
          </Button>
        </Flex>
      </Stack>
    </form>
  );
}
