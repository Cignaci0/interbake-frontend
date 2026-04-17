import { Box, Card, createListCollection, Field, Flex, Input, InputGroup, Portal, Select, Stack, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import getAllTipoPago from "../services/getAllTipoPago";
import getCuentaCargoCentro from "../services/getCuentaCargoCentro";
import createPagoBasicoService from "../services/createPagoBasicoService";

export default function CreatePagoBasico({ onSuccess }) {
  const [tiposPagos, setTiposPagos] = useState(createListCollection({ items: [] }));

  const [cuentaCargo, setCuentaCargo] = useState(createListCollection({ items: [] }));
  const [loading, setLoading] = useState(false);

  const getTiposPagos = async () => {
    try {
      const response = await getAllTipoPago();

      const formattedData = [
        ...response.data.map((item) => ({
          label: item.descripcion_pago_basico,
          value: item.id_pago_basico.toString(),
        })),
      ];

      setTiposPagos(
        createListCollection({
          items: formattedData,
        })
      );
    } catch (error) {
      setTiposPagos(createListCollection({ items: [] }));
      console.error("Error cargando tipos de pagos:", error);
    }
  };

  const getCuentaCargo = async () => {
    try {
      const response = await getCuentaCargoCentro(localStorage.getItem("centro_id"));

      const lista = [response.data]

      const formattedData = [
        ...lista.map((item) => ({
          label: item.numero_cuenta_cargo,
          value: item.numero_cuenta_cargo.toString(),
        })),
      ];

      setCuentaCargo(
        createListCollection({
          items: formattedData,
        })
      );

      // Seteamos el valor por defecto en el formData
      if (formattedData.length > 0) {
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
    getCuentaCargo()
  }, []);

  // Datos para manejar las fechas
  const [range, setRange] = useState({
    start: "",
    end: ""
  })

  const handleChange = (e) => {
    setRange({
      ...range,
      [e.target.name]: e.target.value
    })
  }

  const [formData, setFormData] = useState({
    tipoPago: "",
    nroFactura: "",
    montoPago: "",
    cuentaCorriente: ""
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
    range.end &&
    archivoSeleccionado
  );

  const handleCrear = async () => {
    if (!isFormValid) {
      toast.error("Por favor, complete todos los campos y suba la boleta.");
      return;
    }

    console.log("Crear pago básico", {
      ...formData,
      ...range,
      archivo: archivoSeleccionado
    });

    setLoading(true);
    const toastId = toast.loading("Enviando pago...");

    try {
      await createPagoBasicoService({
        ...formData,
        ...range,
        archivo: archivoSeleccionado
      });

      toast.success("Pago creado correctamente", { id: toastId });

      // Limpiar formulario
      setFormData({
        tipoPago: "",
        nroFactura: "",
        montoPago: "",
        cuentaCorriente: formData.cuentaCorriente // Mantenemos la cuenta corriente ya que es fija por centro
      });
      setRange({ start: "", end: "" });
      setArchivoSeleccionado(null);
      if (onSuccess) onSuccess();

    } catch (error) {
      console.error("Error al crear pago:", error);
      toast.error(error.response?.data?.message || "Error al crear el pago básico", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleLimpiar = () => {
    setFormData({
      tipoPago: "",
      nroFactura: "",
      montoPago: "",
      cuentaCorriente: formData.cuentaCorriente // Se mantiene la cuenta asignada
    });
    setRange({ start: "", end: "" });
    setArchivoSeleccionado(null);
    const fileInput = document.getElementById("upload-boleta");
    if (fileInput) fileInput.value = "";
  };

  return (
    <>
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
              <label htmlFor="upload-boleta" style={{ cursor: "pointer" }}>
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
                  {archivoSeleccionado ? "✅ Documento: " + archivoSeleccionado.name : "📎 Adjuntar Boleta (PDF/Excel)"}
                </Box>
              </label>
              <input
                id="upload-boleta"
                type="file"
                accept=".pdf,.xls,.xlsx"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
            </Box>

            <Flex gap={4}>
              <Box
                as="button"
                onClick={handleLimpiar}
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
                Limpiar
              </Box>

              <Box
                as="button"
                onClick={handleCrear}
                disabled={loading}
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
                {loading ? "Procesando..." : "Registrar Pago"}
              </Box>
            </Flex>
          </Flex>
        </Stack>
      </Card.Root>
    </>
  );
}