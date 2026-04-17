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
  Dialog
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { LuChevronLeft, LuChevronRight, LuPencil, LuTrash2, LuCalendarDays } from "react-icons/lu";
import toast from "react-hot-toast";
import CreateTurno from "../components/CreateTurno";
import UpdateTurno from "../components/UpdateTurno";
import DetalleTurno from "../components/DetalleTurno";
import { Tooltip } from "../components/ui/tooltip";
import getTurnos from "../services/getTurnos";
import deleteTurnoService from "../services/deleteTurno";

export default function Turnos({ activeView }) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [totalRecords, setTotalRecords] = useState(0);
  const [openCreate, setOpenCreate] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [openDetalle, setOpenDetalle] = useState(false);
  const [selectedTurno, setSelectedTurno] = useState(null);

  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroEstado, setFiltroEstado] = useState(null);

  const [listadoTurnos, setListadoTurnos] = useState([]);
  const [allTurnos, setAllTurnos] = useState([]);

  const limpiarFiltros = () => {
    setFiltroNombre("");
    setFiltroEstado("all");
    setPage(1);
  };

  const fetchTurnos = async () => {
    toast.loading("Buscando...", { id: "search-results" });
    try {
      const response = await getTurnos();
      const dataArray = Array.isArray(response) ? response : (response?.data || []);
      setAllTurnos(dataArray);
      toast.success(`Se han encontrado resultados`, { id: "search-results" });
    } catch (error) {
      toast.error("Error al cargar los datos", { id: "search-results" });
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este turno? Esta acción no se puede deshacer.")) {
      return;
    }

    const toastId = toast.loading("Eliminando turno...");
    try {
      await deleteTurnoService(id);
      toast.success("Turno eliminado exitosamente", { id: toastId });
      fetchTurnos();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error al eliminar el turno", { id: toastId });
      console.error(error);
    }
  };

  useEffect(() => {
    fetchTurnos();
  }, []);

  useEffect(() => {
    let filtrados = [...allTurnos];

    if (filtroNombre) {
      filtrados = filtrados.filter(turno =>
        turno.nombre?.toLowerCase().includes(filtroNombre.toLowerCase())
      );
    }

    if (filtroEstado !== "all" && filtroEstado !== null) {
      filtrados = filtrados.filter(turno =>
        String(turno.estado_id) === String(filtroEstado)
      );
    }

    setTotalRecords(filtrados.length);

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    setListadoTurnos(filtrados.slice(startIndex, endIndex));
  }, [allTurnos, filtroNombre, filtroEstado, page, limit]);

  useEffect(() => {
    if (activeView === "Turnos") {
      fetchTurnos();
    }
  }, [activeView]);

  const estados = createListCollection({
    items: [
      { label: 'Todos', value: 'all' },
      { label: 'Activo', value: 1 },
      { label: 'Inactivo', value: 0 }
    ]
  });

  const limites = createListCollection({
    items: [
      { label: '5', value: 5 },
      { label: '10', value: 10 },
      { label: '15', value: 15 },
      { label: '20', value: 20 }
    ]
  });

  return (
    <>
      <Flex direction="column" overflow={'hidden'} height="100%" bg="gray.50" w="full">
        <Flex direction="column" flex="1" p={2} minH={0}>
          <Box mb={4} flexShrink={0}>
            <Card.Root p={6}>
              <Flex justify="space-between" align="center" mb={4}>
                <Text fontSize={'2xl'} fontWeight="bold">Turnos</Text>
                {true && (
                  <Button
                    bg="#7d001c"
                    color="white"
                    _hover={{ bg: "#7d001c" }}
                    onClick={() => setOpenCreate(true)}
                  >
                    Crear Turno
                  </Button>
                )}
              </Flex>
              <Stack direction={{ base: "column", xl: "row" }} gap="4" align="flex-end" width="full">
                <Field.Root width="250px">
                  <Field.Label fontSize="xs" fontWeight="bold">Nombre del Turno</Field.Label>
                  <Input
                    type="text"
                    size="sm"
                    placeholder="Buscar turno..."
                    value={filtroNombre}
                    onChange={(e) => {
                      setFiltroNombre(e.target.value);
                      setPage(1);
                    }}
                  />
                </Field.Root>

                <Field.Root width="200px">
                  <Field.Label fontSize="xs" fontWeight="bold">Estado</Field.Label>
                  <Select.Root
                    value={filtroEstado !== null ? [filtroEstado] : []}
                    onValueChange={(details) => {
                      setFiltroEstado(details.value[0]);
                      setPage(1);
                    }}
                    collection={estados}
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
                          {estados.items.map((estado) => (
                            <Select.Item item={estado} key={estado.value}>{estado.label}</Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Positioner>
                    </Portal>
                  </Select.Root>
                </Field.Root>
                <Button size="sm" variant="outline" onClick={limpiarFiltros}>
                  Limpiar filtros
                </Button>
              </Stack>
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
                    <Table.ColumnHeader textAlign="center">ID Turno</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="center">Nombre</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="center">Estado</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="center">Acciones</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {listadoTurnos.length > 0 ? (
                    listadoTurnos.map((turno, index) => (
                      <Table.Row key={turno.turno_id || index}>
                        <Table.Cell textAlign="center">{turno.turno_id || "-"}</Table.Cell>
                        <Table.Cell textAlign="center">{turno.nombre || "-"}</Table.Cell>
                        <Table.Cell textAlign="center">
                          <Flex justify="center" align="center">
                            <Box
                              w="12px"
                              h="12px"
                              borderRadius="full"
                              bg={String(turno.estado_id) === "1" ? "green.500" : "red.500"}
                            />
                          </Flex>
                        </Table.Cell>
                        {true && (
                          <Table.Cell textAlign="center">
                            <Flex justify="center" gap={2}>
                              <Tooltip content="Ver detalle turno">
                                <IconButton
                                  size="xs"
                                  variant="ghost"
                                  colorPalette="green"
                                  onClick={() => {
                                    setSelectedTurno(turno);
                                    setOpenDetalle(true);
                                  }}
                                >
                                  <LuCalendarDays />
                                </IconButton>
                              </Tooltip>
                              <Tooltip content="Editar">
                                <IconButton
                                  size="xs"
                                  variant="ghost"
                                  colorPalette="blue"
                                  onClick={() => {
                                    setSelectedTurno(turno);
                                    setOpenUpdate(true);
                                  }}
                                >
                                  <LuPencil />
                                </IconButton>
                              </Tooltip>
                              <Tooltip content="Eliminar">
                                <IconButton
                                  size="xs"
                                  variant="ghost"
                                  colorPalette="red"
                                  onClick={() => handleDelete(turno.turno_id || turno.id)}
                                >
                                  <LuTrash2 />
                                </IconButton>
                              </Tooltip>
                            </Flex>
                          </Table.Cell>
                        )}
                      </Table.Row>
                    ))
                  ) : (
                    <Table.Row>
                      <Table.Cell colSpan={4} textAlign="center" py={10} color="gray.500">
                        No se encontraron registros.
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
                    <IconButton aria-label="Página anterior">
                      <LuChevronLeft />
                    </IconButton>
                  </Pagination.PrevTrigger>
                  <Pagination.Items render={(page) => (
                    <IconButton variant={{ base: 'ghost', _selected: 'outline' }}>
                      {page.value}
                    </IconButton>
                  )} />
                  <Pagination.NextTrigger asChild>
                    <IconButton aria-label="Siguiente página">
                      <LuChevronRight />
                    </IconButton>
                  </Pagination.NextTrigger>
                </ButtonGroup>
              </Pagination.Root>

              <Select.Root onValueChange={(details) => setLimit(details.value[0])} collection={limites} size="sm" width="80px">
                <Select.Control>
                  <Select.Trigger>
                    <Select.ValueText placeholder="15" />
                  </Select.Trigger>
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
                <Dialog.Title>Nuevo Turno</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <CreateTurno
                  onSuccess={() => {
                    setOpenCreate(false);
                    fetchTurnos();
                  }}
                  onCancel={() => setOpenCreate(false)}
                />
              </Dialog.Body>
              <Dialog.CloseTrigger />
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      <Dialog.Root open={openUpdate} onOpenChange={(e) => setOpenUpdate(e.open)} size="xl">
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Editar Turno</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                {selectedTurno && (
                  <UpdateTurno
                    turno={selectedTurno}
                    onSuccess={() => {
                      setOpenUpdate(false);
                      fetchTurnos();
                    }}
                    onCancel={() => setOpenUpdate(false)}
                  />
                )}
              </Dialog.Body>
              <Dialog.CloseTrigger />
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      <Dialog.Root open={openDetalle} onOpenChange={(e) => setOpenDetalle(e.open)} size="xl">
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Detalle Turno</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                {selectedTurno && (
                  <DetalleTurno
                    turno={selectedTurno}
                    onSuccess={() => setOpenDetalle(false)}
                    onCancel={() => setOpenDetalle(false)}
                  />
                )}
              </Dialog.Body>
              <Dialog.CloseTrigger />
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  );
}
