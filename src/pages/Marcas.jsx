import {
  Box,
  Button,
  ButtonGroup,
  Card,
  createListCollection,
  Field,
  Flex,
  IconButton,
  Input,
  Pagination,
  Portal,
  Select,
  Stack,
  Table,
  Text,
  Dialog,
  Grid
} from "@chakra-ui/react";
import { useEffect, useState, useMemo } from "react";
import { LuChevronLeft, LuChevronRight, LuPencil, LuPlus, LuTrash } from "react-icons/lu";
import { Tooltip } from "../components/ui/tooltip";
import getEmpleados from "../services/getEmpleados";
import { toast } from "react-hot-toast";
import getDispositivos from "../services/getDispositivos";
import { getMarcas, eliminarMarca } from "../services/marcas";
import CreateMarca from "../components/CreateMarca";
import HistorialMarca from "../components/HistorialMarca";
import UpdateMarca from "../components/UpdateMarca";

export default function Marcas({ activeView }) {
  const [openCreate, setOpenCreate] = useState(false);
  const [openHistorialId, setOpenHistorialId] = useState(null);
  const [openEditData, setOpenEditData] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [totalRecords, setTotalRecords] = useState(0);

  // Filtros
  const [filtroEmpleado, setFiltroEmpleado] = useState(null);
  const [filtroDispositivo, setFiltroDispositivo] = useState(null);
  const [filtroDesde, setFiltroDesde] = useState("");
  const [filtroHasta, setFiltroHasta] = useState("");
  const [busquedaText, setBusquedaText] = useState("");

  const [listadoMarcas, setListadoMarcas] = useState([]);
  const [empleadosData, setEmpleadosData] = useState([]);
  const [dispositivosData, setDispositivosData] = useState([]);

  const filteredMarcas = useMemo(() => {
    if (!busquedaText) return listadoMarcas;
    const text = busquedaText.toLowerCase();
    
    return listadoMarcas.filter(marca => {
      const turnoText = marca.empleado?.turno?.detalle_turno?.horario_id ?
        `${marca.empleado.turno.detalle_turno.horario_id.hora_entrada?.substring(0, 5)} - ${marca.empleado.turno.detalle_turno.horario_id.hora_salida?.substring(0, 5)}` : "";
        
      return (
        (marca.fecha_marca && marca.fecha_marca.toLowerCase().includes(text)) ||
        (marca.hora_marca && String(marca.hora_marca).toLowerCase().includes(text)) ||
        (marca.evento && String(marca.evento).toLowerCase().includes(text)) ||
        (marca.hashcode && String(marca.hashcode).toLowerCase().includes(text)) ||
        (turnoText.toLowerCase().includes(text))
      );
    });
  }, [listadoMarcas, busquedaText]);

  useEffect(() => {
    const fetchEmpleados = async () => {
      try {
        const response = await getEmpleados(1, 1000);
        const data = response?.data || response || [];
        const formatData = Array.isArray(data) ? data : [];
        const formatted = formatData.map(emp => ({
          label: `${emp.nombres} ${emp.apellido_paterno} ${emp.apellido_materno || ''}`.trim(),
          value: emp.num_ficha
        }));
        setEmpleadosData(formatted);
      } catch (err) {
        console.error("Error al obtener empleados", err);
      }
    };

    const fetchDispositivos = async () => {
      try {
        const response = await getDispositivos();
        const data = response?.data || response || [];
        const formatData = Array.isArray(data) ? data : [];
        const formatted = formatData.map(disp => ({
          label: disp.nombre || `Dispositivo ${disp.dispositivo_id}`,
          value: disp.dispositivo_id
        }));
        setDispositivosData(formatted);
      } catch (err) {
        console.error("Error al obtener dispositivos", err);
      }
    };

    fetchEmpleados();
    fetchDispositivos();
  }, []);

  const empleadosColl = useMemo(() => createListCollection({ items: empleadosData }), [empleadosData]);
  const dispositivosColl = useMemo(() => createListCollection({ items: dispositivosData }), [dispositivosData]);

  const limites = createListCollection({
    items: [
      { label: '5', value: 5 },
      { label: '10', value: 10 },
      { label: '15', value: 15 },
      { label: '20', value: 20 },
      { label: '25', value: 25 },
    ]
  });

  const limpiarFiltros = () => {
    setFiltroEmpleado(null);
    setFiltroDispositivo(null);
    setFiltroDesde("");
    setFiltroHasta("");
    setBusquedaText("");
    setPage(1);
    setListadoMarcas([]);
  };

  const handleBuscar = async () => {
    if (!filtroEmpleado || !filtroDesde || !filtroHasta) {
      toast.error("Faltan filtros obligatorios");
      return;
    }

    const toastId = toast.loading("Buscando marcas...");
    try {
      console.log("Payload:", { filtroEmpleado, filtroDesde, filtroHasta });
      const resultados = await getMarcas(filtroEmpleado, filtroDesde, filtroHasta);
      console.log("Resultados:", resultados);
      const marcas = Array.isArray(resultados) ? resultados : (resultados.data || []);
      setListadoMarcas(marcas);
      setTotalRecords(marcas.length);
      toast.success(marcas.length > 0 ? "Resultados encontrados" : "No hay marcas para esta selección", { id: toastId });
    } catch (error) {
      console.error("Error al buscar marcas", error);
      toast.error("Falló la búsqueda de marcas", { id: toastId });
    }
  };

  const handleEliminar = async (idMarca) => {
    if (!window.confirm("¿Está seguro de eliminar esta marca?")) return;
    
    const toastId = toast.loading("Eliminando marca...");
    try {
      await eliminarMarca(idMarca);
      toast.success("Marca eliminada exitosamente", { id: toastId });
      if (filtroEmpleado && filtroDesde && filtroHasta) {
        handleBuscar();
      }
    } catch (error) {
      toast.error(error.message || "Error al eliminar la marca", { id: toastId });
      console.error(error);
    }
  };

  return (
    <>
      <Flex direction="column" overflow={'hidden'} height="100%" bg="gray.50" w="full">
        <Flex direction="column" flex="1" p={2} minH={0}>
          <Box mb={4} flexShrink={0}>
            <Card.Root p={6}>
              <Flex justify="space-between" align="center" mb={4}>
                <Text fontSize={'2xl'} fontWeight="bold">Admin Marcas</Text>
                <Button
                  bg="#7d001c"
                  color="white"
                  _hover={{ bg: "#9a0022" }}
                  disabled={!filtroEmpleado || !filtroDispositivo}
                  onClick={() => setOpenCreate(true)}
                >
                  <LuPlus style={{ marginRight: "8px" }} /> Nuevo Registro
                </Button>
              </Flex>

              {/* Filtros */}
              <Flex gap="4" align="flex-end" width="full" wrap="wrap">

                <Field.Root width="220px">
                  <Field.Label fontSize="xs" fontWeight="bold">Empleado</Field.Label>
                  <Select.Root
                    value={filtroEmpleado ? [filtroEmpleado] : []}
                    onValueChange={(details) => setFiltroEmpleado(details.value[0])}
                    collection={empleadosColl}
                    size="sm"
                  >
                    <Select.Control><Select.Trigger><Select.ValueText placeholder="Seleccionar..." /></Select.Trigger></Select.Control>
                    <Portal><Select.Positioner><Select.Content>
                      {empleadosColl.items.map(i => <Select.Item item={i} key={i.value}>{i.label}</Select.Item>)}
                    </Select.Content></Select.Positioner></Portal>
                  </Select.Root>
                </Field.Root>

                <Field.Root width="200px">
                  <Field.Label fontSize="xs" fontWeight="bold">Dispositivo</Field.Label>
                  <Select.Root
                    value={filtroDispositivo ? [filtroDispositivo] : []}
                    onValueChange={(details) => setFiltroDispositivo(details.value[0])}
                    collection={dispositivosColl}
                    size="sm"
                  >
                    <Select.Control><Select.Trigger><Select.ValueText placeholder="Seleccionar..." /></Select.Trigger></Select.Control>
                    <Portal><Select.Positioner><Select.Content>
                      {dispositivosColl.items.map(i => <Select.Item item={i} key={i.value}>{i.label}</Select.Item>)}
                    </Select.Content></Select.Positioner></Portal>
                  </Select.Root>
                </Field.Root>

                <Field.Root width="150px">
                  <Field.Label fontSize="xs" fontWeight="bold">Desde</Field.Label>
                  <Input type="date" size="sm" value={filtroDesde} onChange={(e) => setFiltroDesde(e.target.value)} />
                </Field.Root>

                <Field.Root width="150px">
                  <Field.Label fontSize="xs" fontWeight="bold">Hasta</Field.Label>
                  <Input type="date" size="sm" value={filtroHasta} onChange={(e) => setFiltroHasta(e.target.value)} />
                </Field.Root>

                <Field.Root width="250px">
                  <Field.Label fontSize="xs" fontWeight="bold">Buscar en resultados</Field.Label>
                  <Input size="sm" placeholder="Buscar..." value={busquedaText} onChange={(e) => setBusquedaText(e.target.value)} />
                </Field.Root>

                <Button size="sm" bg="#7d001c" color="white" _hover={{ bg: "#9a0022" }} onClick={handleBuscar} disabled={!filtroEmpleado || !filtroDesde || !filtroHasta}>
                  Buscar
                </Button>
                <Button size="sm" variant="outline" onClick={limpiarFiltros}>
                  Limpiar
                </Button>

              </Flex>
            </Card.Root>
          </Box>

          <Flex
            bg="white"
            borderRadius="md"
            borderWidth="1px"
            direction="column"
            flex={1}
            minH={0}
            overflow={'hidden'}
            boxShadow="sm"
          >
            <Box flex={1} overflow={'auto'}>
              <Table.Root variant="outline" stickyHeader striped size="sm" width="full">
                <Table.Header>
                  <Table.Row bg="gray.50">
                    <Table.ColumnHeader textAlign="center">Fecha Marca</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="center">Hora Marca</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="center">Evento</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="center">Turno</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="center">Más Info</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="center">Hashcode</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="center">Tipo Marca</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="center">Actualización</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="center">Comentario</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="center">Acciones</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {filteredMarcas.length > 0 ? (
                    filteredMarcas.map((marca, index) => (
                      <Table.Row key={index}>
                        <Table.Cell textAlign="center">{marca.fecha_marca}</Table.Cell>
                        <Table.Cell textAlign="center">{marca.hora_marca || "-"}</Table.Cell>
                        <Table.Cell textAlign="center">{marca.evento === 1 ? "Entrada" : marca.evento === 2 ? "Salida" : "-"}</Table.Cell>
                        <Table.Cell textAlign="center">
                          {marca.empleado?.turno?.detalle_turno?.horario_id
                            ? `${marca.empleado.turno.detalle_turno.horario_id.hora_entrada?.substring(0, 5)} - ${marca.empleado.turno.detalle_turno.horario_id.hora_salida?.substring(0, 5)}`
                            : "-"}
                        </Table.Cell>
                        <Table.Cell textAlign="center">{marca.info_adicional || "-"}</Table.Cell>
                        <Table.Cell textAlign="center">{marca.hashcode || "-"}</Table.Cell>
                        <Table.Cell textAlign="center">{marca.tipo_marca || "-"}</Table.Cell>
                        <Table.Cell textAlign="center">
                          {marca.marca_id && (
                            <Button size="xs" bg="#7d001c" color="white" _hover={{ bg: "#9a0022" }} variant="solid" onClick={() => setOpenHistorialId(marca.marca_id)}>Historial</Button>
                          )}
                        </Table.Cell>
                        <Table.Cell textAlign="center">{marca.comentario}</Table.Cell>
                        <Table.Cell textAlign="center">
                           {marca.marca_id && (
                             <Flex justify="center" gap={2}>
                               <Tooltip content="Editar">
                                 <IconButton size="xs" variant="ghost" colorPalette="blue" onClick={() => setOpenEditData(marca)}>
                                   <LuPencil />
                                 </IconButton>
                               </Tooltip>
                               <Tooltip content="Eliminar">
                                 <IconButton size="xs" variant="ghost" colorPalette="red" onClick={() => handleEliminar(marca.marca_id)}>
                                   <LuTrash />
                                 </IconButton>
                               </Tooltip>
                             </Flex>
                           )}
                        </Table.Cell>
                      </Table.Row>
                    ))
                  ) : (
                    <Table.Row>
                      <Table.Cell colSpan={10} textAlign="center" py={10} color="gray.500">
                        {listadoMarcas.length === 0 ? "Seleccione un empleado y un rango de fechas para comenzar la búsqueda" : "No se encontraron coincidencias para la búsqueda"}
                      </Table.Cell>
                    </Table.Row>
                  )}
                </Table.Body>
              </Table.Root>
            </Box>
            <Flex p={4} borderTopWidth="1px" justifyContent="space-between" bg="gray.50" mt="auto">
              <Pagination.Root
                count={totalRecords}
                pageSize={limit}
                page={page}
                onPageChange={(details) => setPage(details.page)}
              >
                <ButtonGroup variant="outline" size="sm" attached>
                  <Pagination.PrevTrigger asChild>
                    <IconButton aria-label="Página anterior"><LuChevronLeft /></IconButton>
                  </Pagination.PrevTrigger>
                  <Pagination.Items render={(page) => (
                    <IconButton variant={{ base: 'ghost', _selected: 'outline' }}>{page.value}</IconButton>
                  )} />
                  <Pagination.NextTrigger asChild>
                    <IconButton aria-label="Siguiente página"><LuChevronRight /></IconButton>
                  </Pagination.NextTrigger>
                </ButtonGroup>
              </Pagination.Root>

              <Select.Root onValueChange={(details) => setLimit(details.value[0])} collection={limites} size="sm" width="80px">
                <Select.Control>
                  <Select.Trigger><Select.ValueText placeholder="15" /></Select.Trigger>
                </Select.Control>
                <Portal>
                  <Select.Positioner>
                    <Select.Content>
                      {limites.items.map(limite => (
                        <Select.Item item={limite} key={limite.value}>{limite.label}</Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Positioner>
                </Portal>
              </Select.Root>
            </Flex>
          </Flex>
        </Flex>
      </Flex>

      <Dialog.Root open={openCreate} onOpenChange={(e) => setOpenCreate(e.open)} size="xl">
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Nuevo Registro de Marca</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <CreateMarca
                  numFicha={filtroEmpleado}
                  dispositivoId={filtroDispositivo}
                  onSuccess={() => {
                    setOpenCreate(false);
                    if (filtroEmpleado && filtroDesde && filtroHasta) {
                      handleBuscar();
                    }
                  }}
                  onCancel={() => setOpenCreate(false)}
                />
              </Dialog.Body>
              <Dialog.CloseTrigger />
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      <HistorialMarca 
        isOpen={!!openHistorialId}
        marcaId={openHistorialId}
        onClose={() => setOpenHistorialId(null)}
      />

      <UpdateMarca 
        isOpen={!!openEditData}
        marcaToEdit={openEditData}
        onSuccess={() => {
          setOpenEditData(null);
          if (filtroEmpleado && filtroDesde && filtroHasta) {
            handleBuscar();
          }
        }}
        onClose={() => setOpenEditData(null)}
      />
    </>
  );
}
