import { Box, Button, Card, Checkbox, createListCollection, Field, Flex, Input, InputGroup, List, Portal, Select, Separator, Stack, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import getTiposPagosNominas from "../services/getTiposPagosNominas";
import obtenerTodosPorEstadoId from "../services/obtenerTodosPorEstadoId";
import getDetallePagoNomina from "../services/getDetallePagoNomina";
import editarPagosASolicitud from "../services/editarPagosASolicitud";
import toast from "react-hot-toast";
import { Tooltip } from "../components/ui/tooltip";

function EditarSolicitudPago({ solicitudItem, onCancel, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [descripcion, setDescripcion] = useState(solicitudItem.descripcion_solicitud || solicitudItem.descripcion || "");


  const [pagosDisponibles, setPagosDisponibles] = useState([]);

  async function obtenerPagosDisponibles() {
    try {
      const response = await obtenerTodosPorEstadoId(0);
      setPagosDisponibles(response.data);
    } catch (error) {
      console.error("Error al obtener pagos disponibles:", error);
    }
  }

  useEffect(() => {
    obtenerPagosDisponibles();
  }, []);

  console.log(pagosDisponibles);


  const [filtroTipo, setFiltroTipo] = useState(
    solicitudItem.tipoPagoNomina?.id_pago_nomina?.toString() ||
    solicitudItem.id_pago_nomina?.toString() ||
    null
  );

  const [tiposPagos, setTiposPagos] = useState(createListCollection({ items: [] }));
  const [pagosNoAsignados, setPagosNoAsignados] = useState([]);
  const [pagosAsignados, setPagosAsignados] = useState([]);
  const [originalDetalles, setOriginalDetalles] = useState([]);

  const [selectedDisponibles, setSelectedDisponibles] = useState([]);
  const [selectedAsignados, setSelectedAsignados] = useState([]);

  const isFormValid = Boolean(
    filtroTipo &&
    descripcion.trim().length > 0 &&
    pagosAsignados.length > 0
  );

  const toggleSelection = (id, listType) => {
    if (listType === 'disponible') {
      setSelectedDisponibles(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
    } else {
      setSelectedAsignados(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
    }
  };

  const handleMoveSelectedToRight = () => {
    const toMove = pagosFiltrados.filter(p => selectedDisponibles.includes(p.correlativo_pago_nomina));
    if (toMove.length === 0) return;
    setPagosAsignados([...pagosAsignados, ...toMove]);
    setPagosNoAsignados(pagosNoAsignados.filter(p => !toMove.includes(p)));
    setSelectedDisponibles([]);
  };

  const handleMoveAllToRight = () => {
    if (pagosFiltrados.length === 0) return;
    setPagosAsignados([...pagosAsignados, ...pagosFiltrados]);
    setPagosNoAsignados(pagosNoAsignados.filter(p => !pagosFiltrados.includes(p)));
    setSelectedDisponibles([]);
  };

  const handleMoveSelectedToLeft = () => {
    const toMove = pagosAsignados.filter(p => selectedAsignados.includes(p.correlativo_pago_nomina));
    if (toMove.length === 0) return;

    const restoredItems = toMove.map(p => ({
      ...p,
      id_pago_nomina: p.id_pago_nomina || filtroTipo,
      tipoPagoNomina: p.tipoPagoNomina || { id_pago_nomina: filtroTipo }
    }));

    setPagosNoAsignados([...pagosNoAsignados, ...restoredItems]);
    setPagosAsignados(pagosAsignados.filter(p => !selectedAsignados.includes(p.correlativo_pago_nomina)));
    setSelectedAsignados([]);
  };

  const handleMoveAllToLeft = () => {
    if (pagosAsignados.length === 0) return;

    const restoredItems = pagosAsignados.map(p => ({
      ...p,
      id_pago_nomina: p.id_pago_nomina || filtroTipo,
      tipoPagoNomina: p.tipoPagoNomina || { id_pago_nomina: filtroTipo }
    }));

    setPagosNoAsignados([...pagosNoAsignados, ...restoredItems]);
    setPagosAsignados([]);
    setSelectedAsignados([]);
  };

  const initData = async () => {
    try {
      const respTipos = await getTiposPagosNominas();
      const formattedData = [
        { label: "Todos los tipos", value: "all" },
        ...respTipos.data.map((item) => ({
          label: item.descripcion_pago_nomina,
          value: item.id_pago_nomina.toString(),
        })),
      ];
      setTiposPagos(createListCollection({ items: formattedData }));

      const resPagosSolicitud = await getDetallePagoNomina(solicitudItem.id_solicitud_pago);
      const dataAsignados = resPagosSolicitud.data;
      const pagosYaAsignados = Array.isArray(dataAsignados) ? dataAsignados : dataAsignados ? [dataAsignados] : [];
      setPagosAsignados(pagosYaAsignados);
      setOriginalDetalles(pagosYaAsignados);

      // 3. Cargar pagos NO asignados en estado 0 y del respectivo centro de costo
      const cencoId = null;
      const responseNoAsignados = await obtenerTodosPorEstadoId(0, cencoId);
      const dataNoAsignados = responseNoAsignados.data;
      const arrNoAsignados = Array.isArray(dataNoAsignados) ? dataNoAsignados : dataNoAsignados ? [dataNoAsignados] : [];
      setPagosNoAsignados(arrNoAsignados);

    } catch (error) {
      console.error("Error inicializando datos en editar:", error);
      toast.error("Error al cargar los datos de la solicitud");
    }
  };

  useEffect(() => {
    initData();
  }, [solicitudItem.id_solicitud_pago]);

  const pagosFiltrados = pagosNoAsignados.filter(pago => {
    if (!filtroTipo || filtroTipo === "all") return true;
    const pagoTipoId = pago.tipoPagoNomina?.id_pago_nomina || pago.id_pago_nomina;
    return pagoTipoId?.toString() === filtroTipo;
  });

  const renderTooltipContent = (pago) => (
    <Box p={1}>
      <Text fontSize="xs"><b>Beneficiario:</b> {pago.nombre_beneficiario}</Text>
      <Text fontSize="xs"><b>RUT:</b> {pago.rut_beneficiario}</Text>
      <Text fontSize="xs"><b>Monto:</b> ${pago.monto_transferencia}</Text>
      <Text fontSize="xs"><b>Factura/Boleta:</b> {pago.numero_factura_boleta || "-"}</Text>
      <Text fontSize="xs"><b>Cuenta destino:</b> {pago.numero_cuenta_destino || "-"}</Text>
    </Box>
  );

  const handleLimpiar = () => {
    setDescripcion(solicitudItem.descripcion_solicitud || solicitudItem.descripcion || "");
    const toResetDisponibles = pagosAsignados.filter(p1 => !originalDetalles.find(p2 => p2.correlativo_pago_nomina === p1.correlativo_pago_nomina));

    // Restauramos todo a la base de originialDetalles
    const reAsignados = [...originalDetalles];
    const reNoAsignados = [...pagosNoAsignados, ...toResetDisponibles].filter(p => !reAsignados.find(a => a.correlativo_pago_nomina === p.correlativo_pago_nomina));

    setPagosAsignados(reAsignados);
    setPagosNoAsignados(reNoAsignados);
    setSelectedDisponibles([]);
    setSelectedAsignados([]);
  };

  const handleEditar = async () => {
    if (!isFormValid) {
      toast.error("Por favor complete los campos y asigne al menos un pago.");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Actualizando solicitud de pago...");

    try {
      const payload = {
        pagoIds: pagosAsignados.map(p => p.correlativo_pago_nomina),
        descripcion_solicitud: descripcion
      };

      await editarPagosASolicitud(solicitudItem.id_solicitud_pago, payload);

      toast.success("Solicitud actualizada con éxito", { id: toastId });
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error actualizando solicitud:", error);
      toast.error(error.response?.data?.message || "Error al actualizar la solicitud", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card.Root p={0} border="none" boxShadow="none" bg="transparent">
      <Stack gap={6} w="full">
        <Flex gap={4}>
          <Field.Root width="250px" disabled>
            <Field.Label fontSize="xs" fontWeight="bold">Tipo pago</Field.Label>
            <Select.Root
              onValueChange={(details) => setFiltroTipo(details.value[0])}
              value={filtroTipo !== null ? [filtroTipo] : []}
              collection={tiposPagos}
              size="sm"
            >
              <Select.Control>
                <Select.Trigger>
                  <Select.ValueText placeholder="Seleccionar..." />
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

          <Field.Root width="250px">
            <Field.Label fontSize="xs" fontWeight="bold">Descripción (ID: {solicitudItem.id_solicitud_pago})</Field.Label>
            <Input size={"sm"} placeholder="Ingrese descripción" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
          </Field.Root>
        </Flex>

        <Box bg="white" flex={1} p={6} boxShadow="sm" display="flex" alignItems="center" justifyContent="center">
          <Box p="6">
            <Flex gap="4" h="340px">
              {/* Disponibles */}
              <Stack flex="1">
                <Text textStyle="xs" fontWeight="bold">Pagos disponibles</Text>
                <Box flex="1" w={"240px"} border="1px solid" borderColor="border.emphasized" rounded="md" overflowY="auto" bg="bg.panel">
                  <List.Root variant="plain">
                    {pagosFiltrados.length > 0 ? (
                      pagosFiltrados.map((pago, idx) => (
                        <Tooltip key={pago.correlativo_pago_nomina || idx} content={renderTooltipContent(pago)} showArrow placement="right" openDelay={200}>
                          <List.Item p="2" _hover={{ bg: "bg.muted" }} cursor="pointer" display="flex" alignItems="center">
                            <Checkbox.Root
                              size="sm"
                              me="3"
                              checked={selectedDisponibles.includes(pago.correlativo_pago_nomina)}
                              onCheckedChange={() => toggleSelection(pago.correlativo_pago_nomina, 'disponible')}
                            >
                              <Checkbox.Control />
                            </Checkbox.Root>
                            <Box flex="1" onClick={() => toggleSelection(pago.correlativo_pago_nomina, 'disponible')}>
                              <Text textStyle="sm" truncate maxW="180px" title={pago.nombre_beneficiario}>{pago.nombre_beneficiario || "Sin descripción"}</Text>
                            </Box>
                          </List.Item>
                        </Tooltip>
                      ))
                    ) : (
                      <Text p={4} textStyle="sm">No hay pagos disponibles</Text>
                    )}
                  </List.Root>
                </Box>
              </Stack>

              {/* Botones de acción */}
              <Stack alignSelf="center" gap="2">
                <Button variant="outline" size="xs" onClick={handleMoveAllToRight}>&gt;&gt;</Button>
                <Button variant="outline" size="xs" onClick={handleMoveSelectedToRight} disabled={selectedDisponibles.length === 0}>&gt;</Button>
                <Button variant="outline" size="xs" onClick={handleMoveSelectedToLeft} disabled={selectedAsignados.length === 0}>&lt;</Button>
                <Button variant="outline" size="xs" onClick={handleMoveAllToLeft}>&lt;&lt;</Button>
              </Stack>

              {/* Asignados */}
              <Stack flex="1">
                <Text textStyle="xs" fontWeight="bold">Pagos asignados ({pagosAsignados.length})</Text>
                <Box flex="1" w={"240px"} border="1px solid" borderColor="border.emphasized" rounded="md" overflowY="auto" bg="bg.panel">
                  <List.Root variant="plain">
                    {pagosAsignados.length > 0 ? (
                      pagosAsignados.map((pago, idx) => (
                        <Tooltip key={pago.correlativo_pago_nomina || idx} content={renderTooltipContent(pago)} showArrow placement="right" openDelay={200}>
                          <List.Item p="2" _hover={{ bg: "bg.muted" }} cursor="pointer" display="flex" alignItems="center">
                            <Checkbox.Root
                              size="sm"
                              me="3"
                              checked={selectedAsignados.includes(pago.correlativo_pago_nomina)}
                              onCheckedChange={() => toggleSelection(pago.correlativo_pago_nomina, 'asignado')}
                            >
                              <Checkbox.Control />
                            </Checkbox.Root>
                            <Box flex="1" onClick={() => toggleSelection(pago.correlativo_pago_nomina, 'asignado')}>
                              <Text textStyle="sm" truncate maxW="180px" title={pago.nombre_beneficiario}>{pago.nombre_beneficiario || "Sin descripción"}</Text>
                            </Box>
                          </List.Item>
                        </Tooltip>
                      ))
                    ) : (
                      <Text p={4} textStyle="sm">No hay pagos asignados</Text>
                    )}
                  </List.Root>
                </Box>
              </Stack>
            </Flex>
          </Box>
        </Box>

        {/* Fila 3: Acciones */}
        <Flex justify="end" pt={2}>
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
              Cancelar
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
              px="4"
              bg="white"
              color="gray.700"
              _hover={{ bg: "gray.50" }}
              transition="all 0.2s"
              cursor="pointer"
            >
              Revertir cambios
            </Box>

            <Box
              as="button"
              onClick={handleEditar}
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
              {loading ? "Procesando..." : "Guardar Cambios"}
            </Box>
          </Flex>
        </Flex>
      </Stack>
    </Card.Root>
  );
}

export default EditarSolicitudPago;
