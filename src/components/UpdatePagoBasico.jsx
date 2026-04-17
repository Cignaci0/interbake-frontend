import { Box, Card, createListCollection, Field, Flex, Input, InputGroup, Portal, Select, Stack, Text, Link } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import getAllTipoPago from "../services/getAllTipoPago";
import getCuentaCargoCentro from "../services/getCuentaCargoCentro";
import updatePagoBasicoService from "../services/updatePagoBasicoService";
import { LuExternalLink } from "react-icons/lu";

export default function UpdatePagoBasico({ pago, onSuccess, onCancel }) {
  const [tiposPagos, setTiposPagos] = useState(createListCollection({ items: [] }));
  const [cuentaCargo, setCuentaCargo] = useState(createListCollection({ items: [] }));
  const [loading, setLoading] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return dateString.split('T')[0];
  };

  const getTiposPagos = async () => {
    try {
      const response = await getAllTipoPago();
      const formattedData = response.data.map((item) => ({
        label: item.descripcion_pago_basico,
        value: item.id_pago_basico.toString(),
      }));
      setTiposPagos(createListCollection({ items: formattedData }));
    } catch (error) {
      setTiposPagos(createListCollection({ items: [] }));
      console.error("Error cargando tipos de pagos:", error);
    }
  };

  const getCuentaCargo = async () => {
    try {
      const response = await getCuentaCargoCentro(localStorage.getItem("centro_id"));
      const formattedData = [{
        label: response.data.numero_cuenta_cargo,
        value: response.data.numero_cuenta_cargo.toString(),
      }];
      setCuentaCargo(createListCollection({ items: formattedData }));

      // Si la cuenta estaba vacía, la llenamos por defecto, aunque ya debería venir de `pago`
      if (!formData.cuentaCorriente && formattedData.length > 0) {
        setFormData(prev => ({
          ...prev,
          cuentaCorriente: formattedData[0].value
        }));
      }
    } catch (error) {
      setCuentaCargo(createListCollection({ items: [] }));
      console.error("Error cargando cuenta cargo:", error);
    }
  };

  useEffect(() => {
    getTiposPagos();
    getCuentaCargo();
  }, []);

  const [range, setRange] = useState({
    start: formatDate(pago?.fecha_periodo_inicio),
    end: formatDate(pago?.fecha_periodo_fin)
  });

  const handleChange = (e) => {
    setRange({
      ...range,
      [e.target.name]: e.target.value
    });
  };

  const [formData, setFormData] = useState({
    tipoPago: pago?.tipoPagoBasico?.id_pago_basico?.toString() || pago?.id_pago_basico?.toString() || "",
    nroFactura: pago?.numero_factura || "",
    montoPago: pago?.monto_pago || "",
    cuentaCorriente: pago?.numero_cuenta_cargo || ""
  });

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);

  const handleFileChange = (e) => {
    setArchivoSeleccionado(e.target.files[0] ?? null);
  };

  const isFormValid = Boolean(
    formData.tipoPago &&
    formData.nroFactura &&
    formData.montoPago &&
    formData.cuentaCorriente &&
    range.start &&
    range.end
  );

  const handleActualizar = async () => {
    if (!isFormValid) {
      toast.error("Por favor, complete todos los campos requeridos.");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Actualizando pago...");

    try {
      await updatePagoBasicoService(pago.correlativo_pago_basico || pago.id, {
        ...formData,
        ...range,
        archivo: archivoSeleccionado
      });

      toast.success("Pago actualizado correctamente", { id: toastId });
      if (onSuccess) onSuccess();

    } catch (error) {
      console.error("Error al actualizar pago:", error);
      toast.error(error.response?.data?.message || "Error al actualizar el pago básico", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card.Root p={0} border="none" boxShadow="none" bg="transparent">
      <Stack gap={6} w="full">
        {/* Fila 1: Información Principal */}
        <Box borderBottom="1px solid" borderColor="gray.100" pb={4}>
          <Text fontSize="sm" fontWeight="bold" color="blue.700" mb={4} textTransform="uppercase" letterSpacing="wider">
            Información del Pago
          </Text>
          <Flex gap={4} flexWrap="wrap">
            <Field.Root flex="1" minW="200px">
              <Field.Label fontSize="xs" fontWeight="bold" mb={1}>Tipo de Pago</Field.Label>
              <Select.Root
                collection={tiposPagos}
                size="md"
                value={formData.tipoPago ? [formData.tipoPago] : []}
                onValueChange={(e) => setFormData({ ...formData, tipoPago: e.value[0] })}
              >
                <Select.Control>
                  <Select.Trigger>
                    <Select.ValueText placeholder="Seleccione el tipo..." />
                  </Select.Trigger>
                </Select.Control>
                <Portal>
                  <Select.Positioner>
                    <Select.Content>
                      {tiposPagos.items.map((tipo) => (
                        <Select.Item item={tipo} key={tipo.value}>{tipo.label}</Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Positioner>
                </Portal>
              </Select.Root>
            </Field.Root>

            <Field.Root flex="1" minW="180px">
              <Field.Label fontSize="xs" fontWeight="bold" mb={1}>Nº Factura / Boleta</Field.Label>
              <Input
                type="text"
                name="nroFactura"
                size="md"
                placeholder="Ej: 99999"
                value={formData.nroFactura}
                onChange={handleFormChange}
                focusRingColor="blue.500"
                autoComplete="off"
              />
            </Field.Root>

            <Field.Root flex="1" minW="150px">
              <Field.Label fontSize="xs" fontWeight="bold" mb={1}>Monto del Pago</Field.Label>
              <InputGroup startElement={<Text fontWeight="bold" color="gray.500">$</Text>} w="full">
                <Input
                  type="number"
                  name="montoPago"
                  size="md"
                  placeholder="Ej: 10000"
                  value={formData.montoPago}
                  onChange={handleFormChange}
                  focusRingColor="blue.500"
                  autoComplete="off"
                />
              </InputGroup>
            </Field.Root>
          </Flex>
        </Box>

        {/* Fila 2: Cuenta y Período */}
        <Box borderBottom="1px solid" borderColor="gray.100" pb={4}>
          <Text fontSize="sm" fontWeight="bold" color="blue.700" mb={4} textTransform="uppercase" letterSpacing="wider">
            Detalles de Cuenta y Período
          </Text>
          <Flex gap={4} flexWrap="wrap" align="flex-end">
            <Field.Root flex="1" minW="250px">
              <Field.Label fontSize="xs" fontWeight="bold" mb={1}>Cuenta Corriente (Asignada)</Field.Label>
              <Select.Root
                collection={cuentaCargo}
                size="md"
                disabled
                value={formData.cuentaCorriente ? [formData.cuentaCorriente] : []}
              >
                <Select.Control>
                  <Select.Trigger bg="gray.50">
                    <Select.ValueText placeholder="Cargando cuenta..." />
                  </Select.Trigger>
                </Select.Control>
                <Portal>
                  <Select.Positioner>
                    <Select.Content>
                      {cuentaCargo.items.map((tipo) => (
                        <Select.Item item={tipo} key={tipo.value}>{tipo.label}</Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Positioner>
                </Portal>
              </Select.Root>
            </Field.Root>

            <Flex flex="1" gap={2} align="center" minW="320px">
              <Field.Root flex="1">
                <Field.Label fontSize="xs" fontWeight="bold" mb={1}>Desde</Field.Label>
                <Input
                  type="date"
                  name="start"
                  size="md"
                  value={range.start}
                  max={range.end}
                  onChange={handleChange}
                  focusRingColor="blue.500"
                />
              </Field.Root>
              <Box pt={6}>
                <Text fontSize="sm" fontWeight="bold" color="gray.400">al</Text>
              </Box>
              <Field.Root flex="1">
                <Field.Label fontSize="xs" fontWeight="bold" mb={1}>Hasta</Field.Label>
                <Input
                  type="date"
                  name="end"
                  size="md"
                  value={range.end}
                  min={range.start}
                  onChange={handleChange}
                  focusRingColor="blue.500"
                />
              </Field.Root>
            </Flex>
          </Flex>
        </Box>

        {/* Fila 3: Acciones finales */}
        <Flex justify="space-between" align="center" pt={2}>
          <Box>
            <label htmlFor="upload-boleta-edit" style={{ cursor: "pointer" }}>
              <Box
                as="span"
                display="inline-flex"
                alignItems="center"
                gap={2}
                px={4}
                py={2.5}
                fontSize="sm"
                fontWeight="bold"
                border="2px dashed"
                borderColor={archivoSeleccionado ? "green.400" : "gray.300"}
                borderRadius="lg"
                bg={archivoSeleccionado ? "green.50" : "white"}
                color={archivoSeleccionado ? "green.700" : "gray.600"}
                _hover={{ bg: archivoSeleccionado ? "green.100" : "gray.50", borderColor: "blue.400" }}
                transition="all 0.2s"
              >
                {archivoSeleccionado ? "✅ " + archivoSeleccionado.name : "📎 Cambiar Boleta (PDF/Excel)"}
              </Box>
            </label>
            <input
              id="upload-boleta-edit"
              type="file"
              accept=".pdf,.xls,.xlsx"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            {pago?.ruta_boleta && (
              <Link
                href={`http://45.239.111.189:53274/${encodeURI(pago.ruta_boleta.replace(/^~[/\\]/, "").replace(/\\/g, "/").trim())}`}
                target="_blank"
                download={pago.ruta_boleta.split(/[/\\]/).pop()}
                ml={2}
                color="blue.600"
                fontSize="xs"
                display="inline-flex"
                alignItems="center"
                gap={1}
              >
                Ver actual <LuExternalLink />
              </Link>
            )}
          </Box>

          <Flex gap={4}>
            <Box
              as="button"
              onClick={onCancel}
              display="inline-flex"
              alignItems="center"
              justifyContent="center"
              minW="120px"
              h="44px"
              fontSize="md"
              fontWeight="bold"
              borderRadius="lg"
              border="1px solid"
              borderColor="gray.300"
              bg="white"
              color="gray.700"
              _hover={{ bg: "gray.50" }}
              transition="all 0.2s"
              cursor="pointer"
            >
              Volver
            </Box>

            <Box
              as="button"
              onClick={handleActualizar}
              disabled={loading || !isFormValid}
              display="inline-flex"
              alignItems="center"
              justifyContent="center"
              minW="160px"
              h="44px"
              fontSize="md"
              fontWeight="bold"
              borderRadius="lg"
              bg={isFormValid ? "blue.600" : "gray.200"}
              color={isFormValid ? "white" : "gray.500"}
              boxShadow={isFormValid ? "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)" : "none"}
              _hover={isFormValid && !loading ? { bg: "blue.700", transform: "translateY(-1px)", boxShadow: "lg" } : {}}
              _active={isFormValid && !loading ? { transform: "translateY(0)" } : {}}
              transition="all 0.2s"
              cursor={isFormValid && !loading ? "pointer" : "not-allowed"}
            >
              {loading ? "Actualizando..." : "Actualizar Pago"}
            </Box>
          </Flex>
        </Flex>
      </Stack>
    </Card.Root>
  );
}
