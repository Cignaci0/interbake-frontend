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
import { LuChevronLeft, LuChevronRight, LuPencil, LuDownload, LuTrash2 } from "react-icons/lu";
import toast from "react-hot-toast";
import CreateAcceso from "../components/CreateAcceso";
import UpdateAcceso from "../components/UpdateAcceso";
import { Tooltip } from "../components/ui/tooltip";
import getDispositivos from "../services/getDispositivos";
import deleteDispositivoService from "../services/deleteDispositivo";

export default function Accesos({ activeView }) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [totalRecords, setTotalRecords] = useState(0);
  const [openCreate, setOpenCreate] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [selectedAcceso, setSelectedAcceso] = useState(null);

  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroTipo, setFiltroTipo] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState(null);

  const [listadoAccesos, setListadoAccesos] = useState([]);
  const [allAccesos, setAllAccesos] = useState([]);

  const limpiarFiltros = () => {
    setFiltroNombre("");
    setFiltroTipo("all");
    setFiltroEstado("all");
    setPage(1);
  };


  const fetchAccesos = async () => {
    toast.loading("Buscando...", { id: "search-results" });
    try {
      const response = await getDispositivos();
      const dataArray = Array.isArray(response) ? response : (response?.data || []);
      setAllAccesos(dataArray);
      toast.success(`Se han encontrado resultados`, { id: "search-results" });
    } catch (error) {
      toast.error("Error al cargar los datos", { id: "search-results" });
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este acceso? Esta acción no se puede deshacer.")) {
      return;
    }

    const toastId = toast.loading("Eliminando acceso...");
    try {
      await deleteDispositivoService(id);
      toast.success("Acceso eliminado exitosamente", { id: toastId });
      fetchAccesos();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error al eliminar el acceso", { id: toastId });
      console.error(error);
    }
  };

  useEffect(() => {
    fetchAccesos();
  }, []);

  useEffect(() => {
    let filtrados = [...allAccesos];

    if (filtroNombre) {
      filtrados = filtrados.filter(acceso =>
        acceso.nombre?.toLowerCase().includes(filtroNombre.toLowerCase())
      );
    }

    if (filtroEstado !== "all" && filtroEstado !== null) {
      filtrados = filtrados.filter(acceso =>
        String(acceso.estado) === String(filtroEstado)
      );
    }

    setTotalRecords(filtrados.length);

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    setListadoAccesos(filtrados.slice(startIndex, endIndex));
  }, [allAccesos, filtroNombre, filtroEstado, page, limit]);

  useEffect(() => {
    if (activeView === "Accesos") {
      fetchAccesos();
    }
  }, [activeView]);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return dateString.split('T')[0];
  };

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
                <Text fontSize={'2xl'} fontWeight="bold">Accesos</Text>
                {true && (
                  <Button
                    bg="#7d001c"
                    color="white"
                    _hover={{ bg: "#7d001c" }}
                    onClick={() => setOpenCreate(true)}
                  >
                    Crear Acceso
                  </Button>
                )}
              </Flex>
              <Stack direction={{ base: "column", xl: "row" }} gap="4" align="flex-end" width="full">
                <Field.Root width="250px">
                  <Field.Label fontSize="xs" fontWeight="bold">Nombre del Acceso</Field.Label>
                  <Input
                    type="text"
                    size="sm"
                    placeholder="Buscar acceso..."
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
                    <Table.ColumnHeader textAlign="center">Nombre</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="center">Ubicación</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="center">Comuna</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="center">Modelo</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="center">Fabricante</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="center">IP</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="center">Estado</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="center">Acciones</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {listadoAccesos.length > 0 ? (
                    listadoAccesos.map((acceso, index) => (
                      <Table.Row key={acceso.dispositivo_id || index}>
                        <Table.Cell textAlign="center">{acceso.nombre || "-"}</Table.Cell>
                        <Table.Cell textAlign="center">{acceso.ubicacion || "-"}</Table.Cell>
                        <Table.Cell textAlign="center">{acceso.comuna || "-"}</Table.Cell>
                        <Table.Cell textAlign="center">{acceso.modelo || "-"}</Table.Cell>
                        <Table.Cell textAlign="center">{acceso.fabricante || "-"}</Table.Cell>
                        <Table.Cell textAlign="center">{acceso.direccion_ip || "-"}</Table.Cell>
                        <Table.Cell textAlign="center">
                          <Flex justify="center" align="center">
                            <Box
                              w="12px"
                              h="12px"
                              borderRadius="full"
                              bg={String(acceso.estado) === "1" ? "green.500" : "red.500"}
                            />
                          </Flex>
                        </Table.Cell>
                        {true && (
                          <Table.Cell textAlign="center">
                            <Flex justify="center" gap={2}>
                              <Tooltip content="Editar">
                                <IconButton
                                  size="xs"
                                  variant="ghost"
                                  colorPalette="blue"
                                  onClick={() => {
                                    setSelectedAcceso(acceso);
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
                                  onClick={() => handleDelete(acceso.dispositivo_id || acceso.id)}
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
                      <Table.Cell colSpan={9} textAlign="center" py={10} color="gray.500">
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
                <Dialog.Title>Nuevo Acceso</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <CreateAcceso
                  onSuccess={() => {
                    setOpenCreate(false);
                    fetchAccesos();
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
                <Dialog.Title>Editar Acceso</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                {selectedAcceso && (
                  <UpdateAcceso
                    acceso={selectedAcceso}
                    onSuccess={() => {
                      setOpenUpdate(false);
                      fetchAccesos();
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
    </>
  );
}
