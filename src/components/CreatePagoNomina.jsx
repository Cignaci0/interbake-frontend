import { Box, Card, createListCollection, Field, Flex, Input, InputGroup, Portal, Select, Stack, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import getTiposPagosNominas from "../services/getTiposPagosNominas";
import getCuentaCargoCentro from "../services/getCuentaCargoCentro";
import getBancos from "../services/getBancos";
import createPagoNominaService from "../services/createPagoNominaService";
import { validateRut, formatRut } from "../utils/validateRut";

export default function CreatePagoNomina({ onSuccess, onCancel }) {
  const [tiposPagos, setTiposPagos] = useState(createListCollection({ items: [] }));
  const [cuentaCargo, setCuentaCargo] = useState(createListCollection({ items: [] }));
  const [bancos, setBancos] = useState(createListCollection({ items: [] }));
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    tipoPago: "",
    cuentaCargo: "",
    numeroCuentaDestino: "",
    bancoBeneficiario: "",
    rutBeneficiario: "",
    nombreBeneficiario: "",
    montoTransferencia: "",
    numeroFacturaBoleta: "",
    ordenCompra: "",
    detallePago: "",
    emailPrograma: "",
    cuentaDestino: ""
  });

  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);

  const getTiposPagos = async () => {
    try {
      const response = await getTiposPagosNominas();
      const formattedData = response.data.map((item) => ({
        label: item.descripcion_pago_nomina,
        value: item.id_pago_nomina.toString(),
      }));
      setTiposPagos(createListCollection({ items: formattedData }));
    } catch (error) {
      console.error("Error cargando tipos de pagos:", error);
    }
  };

  const getCuentaCargo = async () => {
    try {
      const response = await getCuentaCargoCentro(localStorage.getItem("centro_id"));
      const lista = [response.data];
      const formattedData = lista.map((item) => ({
        label: item.numero_cuenta_cargo,
        value: item.numero_cuenta_cargo.toString(),
      }));
      setCuentaCargo(createListCollection({ items: formattedData }));

      if (formattedData.length > 0) {
        setFormData(prev => ({ ...prev, cuentaCargo: formattedData[0].value }));
      }
    } catch (error) {
      console.error("Error cargando cuenta cargo:", error);
    }
  };

  const getListadoBancos = async () => {
    try {
      const response = await getBancos();
      const formattedData = response.data.map((item) => ({
        label: item.descripcion_banco,
        value: (item.id_banco).toString(),
      }));
      setBancos(createListCollection({ items: formattedData }));
    } catch (error) {

      setBancos(createListCollection({ items: [] }));
    }
  };

  useEffect(() => {
    getTiposPagos();
    getCuentaCargo();
    getListadoBancos();
  }, []);

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    setArchivoSeleccionado(e.target.files[0] ?? null);
  };

  const isRutValid = !formData.rutBeneficiario || validateRut(formData.rutBeneficiario);

  const isFormValid = Boolean(
    formData.tipoPago &&
    formData.cuentaCargo &&
    formData.numeroCuentaDestino &&
    formData.bancoBeneficiario &&
    formData.rutBeneficiario &&
    isRutValid &&
    formData.nombreBeneficiario &&
    formData.montoTransferencia &&
    archivoSeleccionado
  );

  const handleRutChange = (e) => {
    const formatted = formatRut(e.target.value);
    setFormData({
      ...formData,
      rutBeneficiario: formatted
    });
  };

  const handleCrear = async () => {
    if (!isFormValid) {
      if (formData.rutBeneficiario && !isRutValid) {
        toast.error("El RUT ingresado no es válido.");
        return;
      }
      toast.error("Por favor, complete los campos obligatorios y suba el archivo.");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Enviando pago nómina...");

    try {
      await createPagoNominaService({
        ...formData,
        archivo: archivoSeleccionado
      });

      toast.success("Pago nómina creado correctamente", { id: toastId });

      // Limpiar formulario excepto cuenta cargo
      setFormData({
        tipoPago: "",
        cuentaCargo: formData.cuentaCargo,
        numeroCuentaDestino: "",
        bancoBeneficiario: "",
        rutBeneficiario: "",
        nombreBeneficiario: "",
        montoTransferencia: "",
        numeroFacturaBoleta: "",
        ordenCompra: "",
        detallePago: "",
        emailPrograma: "",
        cuentaDestino: ""
      });
      setArchivoSeleccionado(null);
      if (onSuccess) onSuccess();

    } catch (error) {
      console.error("Error al crear pago nómina:", error);
      toast.error(error.response?.data?.message || "Error al crear el pago nómina", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleLimpiar = () => {
    setFormData({
      tipoPago: "",
      cuentaCargo: formData.cuentaCargo, // Se mantiene la cuenta asignada
      numeroCuentaDestino: "",
      bancoBeneficiario: "",
      rutBeneficiario: "",
      nombreBeneficiario: "",
      montoTransferencia: "",
      numeroFacturaBoleta: "",
      ordenCompra: "",
      detallePago: "",
      emailPrograma: "",
      cuentaDestino: ""
    });
    setArchivoSeleccionado(null);
    const fileInput = document.getElementById("upload-archivo");
    if (fileInput) fileInput.value = "";
  };

  return (
    <Card.Root p={0} border="none" boxShadow="none" bg="transparent">
      <Stack gap={6} w="full">
        {/* Fila 1: Información Principal */}
        <Box borderBottom="1px solid" borderColor="gray.100" pb={4}>
          <Text fontSize="sm" fontWeight="bold" color="blue.700" mb={4} textTransform="uppercase" letterSpacing="wider">
            Información del Pago Nómina
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
                    <Select.ValueText placeholder="Seleccione tipo..." />
                  </Select.Trigger>
                </Select.Control>
                <Portal>
                  <Select.Positioner>
                    <Select.Content>
                      {tiposPagos.items.map((item) => (
                        <Select.Item item={item} key={item.value}>{item.label}</Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Positioner>
                </Portal>
              </Select.Root>
            </Field.Root>

            <Field.Root flex="1" minW="200px">
              <Field.Label fontSize="xs" fontWeight="bold" mb={1}>Cuenta Cargo</Field.Label>
              <Select.Root
                collection={cuentaCargo}
                size="md"
                disabled
                value={formData.cuentaCargo ? [formData.cuentaCargo] : []}
                onValueChange={(e) => setFormData({ ...formData, cuentaCargo: e.value[0] })}
              >
                <Select.Control>
                  <Select.Trigger bg="gray.100">
                    <Select.ValueText placeholder="Seleccione cuenta..." />
                  </Select.Trigger>
                </Select.Control>
                <Portal>
                  <Select.Positioner>
                    <Select.Content>
                      {cuentaCargo.items.map((item) => (
                        <Select.Item item={item} key={item.value}>{item.label}</Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Positioner>
                </Portal>
              </Select.Root>
            </Field.Root>

            <Field.Root flex="1" minW="150px">
              <Field.Label fontSize="xs" fontWeight="bold" mb={1}>Monto Transferencia</Field.Label>
              <InputGroup startElement={<Text fontWeight="bold" color="gray.500">$</Text>} w="full">
                <Input
                  type="number"
                  name="montoTransferencia"
                  size="md"
                  placeholder="Ej: 10000"
                  value={formData.montoTransferencia}
                  onChange={handleFormChange}
                />
              </InputGroup>
            </Field.Root>
          </Flex>
        </Box>

        {/* Fila 2: Datos Beneficiario */}
        <Box borderBottom="1px solid" borderColor="gray.100" pb={4}>
          <Text fontSize="sm" fontWeight="bold" color="blue.700" mb={4} textTransform="uppercase" letterSpacing="wider">
            Datos del Beneficiario
          </Text>
          <Flex gap={4} flexWrap="wrap">
            <Field.Root flex="2" minW="250px">
              <Field.Label fontSize="xs" fontWeight="bold" mb={1}>Nombre Beneficiario</Field.Label>
              <Input
                name="nombreBeneficiario"
                placeholder="Nombre completo"
                value={formData.nombreBeneficiario}
                onChange={handleFormChange}
              />
            </Field.Root>
            <Field.Root flex="1" minW="150px" invalid={formData.rutBeneficiario && !isRutValid}>
              <Field.Label fontSize="xs" fontWeight="bold" mb={1}>RUT Beneficiario</Field.Label>
              <Input
                name="rutBeneficiario"
                placeholder="12.345.678-9"
                value={formData.rutBeneficiario}
                onChange={handleRutChange}
              />
              {formData.rutBeneficiario && !isRutValid && (
                <Field.ErrorText fontSize="2xs">RUT inválido</Field.ErrorText>
              )}
            </Field.Root>
          </Flex>
          <Flex gap={4} flexWrap="wrap" mt={4}>
            <Field.Root flex="1" minW="300px">
              <Field.Label fontSize="xs" fontWeight="bold" mb={1}>Banco Beneficiario</Field.Label>
              <Select.Root
                collection={bancos}
                size="md"
                value={formData.bancoBeneficiario ? [formData.bancoBeneficiario] : []}
                onValueChange={(e) => setFormData({ ...formData, bancoBeneficiario: e.value[0] })}
              >
                <Select.Control>
                  <Select.Trigger>
                    <Select.ValueText placeholder="Seleccione banco..." />
                  </Select.Trigger>
                </Select.Control>
                <Portal>
                  <Select.Positioner>
                    <Select.Content>
                      {bancos.items.map((item) => (
                        <Select.Item item={item} key={item.value}>{item.label}</Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Positioner>
                </Portal>
              </Select.Root>
            </Field.Root>
            <Field.Root flex="1" minW="200px">
              <Field.Label fontSize="xs" fontWeight="bold" mb={1}>Nº Cuenta Destino</Field.Label>
              <Input
                name="numeroCuentaDestino"
                placeholder="Número de cuenta"
                value={formData.numeroCuentaDestino}
                onChange={handleFormChange}
              />
            </Field.Root>
            <Field.Root flex="1" minW="200px">
              <Field.Label fontSize="xs" fontWeight="bold" mb={1}>Cuenta Destino inscrita como</Field.Label>
              <Input
                name="cuentaDestino"
                placeholder="Ej: Mi cuenta"
                value={formData.cuentaDestino}
                onChange={handleFormChange}
              />
            </Field.Root>
          </Flex>
        </Box>

        {/* Fila 3: Otros Detalles */}
        <Box borderBottom="1px solid" borderColor="gray.100" pb={4}>
          <Text fontSize="sm" fontWeight="bold" color="blue.700" mb={4} textTransform="uppercase" letterSpacing="wider">
            Detalles del Documento y Notificación
          </Text>
          <Flex gap={4} flexWrap="wrap">
            <Field.Root flex="1" minW="180px" >
              <Field.Label fontSize="xs" fontWeight="bold" mb={1}>Nº Factura / Boleta</Field.Label>
              <Input
                name="numeroFacturaBoleta"
                placeholder="Ej: 12345"
                disabled={formData.tipoPago === "2" ? true : false}
                value={formData.numeroFacturaBoleta}
                onChange={handleFormChange}
              />
            </Field.Root>
            <Field.Root flex="1" minW="180px">
              <Field.Label fontSize="xs" fontWeight="bold" mb={1}>Orden de Compra</Field.Label>
              <Input
                name="ordenCompra"
                placeholder="Ej: OC-999"
                disabled={formData.tipoPago === "2" ? true : false}
                value={formData.ordenCompra}
                onChange={handleFormChange}
              />
            </Field.Root>
            <Field.Root flex="1" minW="200px">
              <Field.Label fontSize="xs" fontWeight="bold" mb={1}>Email Programa</Field.Label>
              <Input
                name="emailPrograma"
                placeholder="email@ejemplo.com"
                value={formData.emailPrograma}
                onChange={handleFormChange}
              />
            </Field.Root>
          </Flex>
          <Field.Root mt={4}>
            <Field.Label fontSize="xs" fontWeight="bold" mb={1}>Detalle / Descripción Pago</Field.Label>
            <Input
              name="detallePago"
              placeholder="Descripción breve"
              value={formData.detallePago}
              onChange={handleFormChange}
            />
          </Field.Root>
        </Box>

        {/* Fila 4: Archivo y Acciones */}
        <Flex justify="space-between" align="center" pt={2}>
          <Box>
            <label htmlFor="upload-archivo" style={{ cursor: "pointer" }}>
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
                {archivoSeleccionado ? "✅ " + archivoSeleccionado.name : "📎 Adjuntar Boleta/Factura (PDF)"}
              </Box>
            </label>
            <input
              id="upload-archivo"
              type="file"
              accept=".pdf"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
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
              disabled={loading || !isFormValid}
              display="inline-flex"
              alignItems="center"
              justifyContent="center"
              minW="160px"
              h="44px"
              fontSize="md"
              px={4}
              fontWeight="bold"
              borderRadius="lg"
              bg={isFormValid ? "blue.600" : "gray.200"}
              color={isFormValid ? "white" : "gray.500"}
              _hover={isFormValid && !loading ? { bg: "blue.700", transform: "translateY(-1px)" } : {}}
              transition="all 0.2s"
              cursor={isFormValid && !loading ? "pointer" : "not-allowed"}
            >
              {loading ? "Procesando..." : "Registrar Pago Nómina"}
            </Box>
          </Flex>
        </Flex>
      </Stack>
    </Card.Root>
  );
}
