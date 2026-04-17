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
import { LuChevronLeft, LuChevronRight, LuPencil, LuDownload, LuTrash2, LuMonitorSmartphone, LuUpload } from "react-icons/lu";
import toast from "react-hot-toast";
import CreateCargo from "../components/CreateCargo";
import UpdateCargo from "../components/UpdateCargo";
import AsignarAccesosCargo from "../components/AsignarAccesosCargo";
import DetalleCargo from "../components/DetalleCargo";
import { Tooltip } from "../components/ui/tooltip";
import getCargos from "../services/getCargos";
import createCargoService from "../services/createCargoService";
import deleteCargoService from "../services/deleteCargo";

export default function Cargos({ activeView }) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [totalRecords, setTotalRecords] = useState(0);
  const [openCreate, setOpenCreate] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [openAsignar, setOpenAsignar] = useState(false);
  const [selectedCargo, setSelectedCargo] = useState(null);
  const [file, setFile] = useState(null);

  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroTipo, setFiltroTipo] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState(null);

  const [listadoCargos, setListadoCargos] = useState([]);
  const [allCargos, setAllCargos] = useState([]); // Store all data for local filtering

  const limpiarFiltros = () => {
    setFiltroNombre("");
    setFiltroTipo("all");
    setFiltroEstado("all");
    setPage(1);
  };


  const handleUpload = () => {
    if (!file) {
      alert("Seleccione un archivo CSV");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target.result;
        const lines = text.split(/\r?\n/);

        // Format: nombre;estado;tipo_cargo
        const cargos = lines.slice(1).map((line) => {
          const columns = line.split(";");
          if (columns.length < 1) return null;
          return {
            nombre: columns[0]?.trim(),
            estado: columns[1]?.trim() ? parseInt(columns[1].trim()) : 1,
            tipo_cargo: columns[2]?.trim() ? parseInt(columns[2].trim()) : 1
          };
        }).filter(c => c && c.nombre);

        if (cargos.length === 0) {
          alert("El archivo CSV está vacío o no tiene el formato correcto.");
          return;
        }

        let guardadosExito = 0;
        let guardadosError = 0;

        const toastId = toast.loading("Procesando carga masiva...");

        for (const cargo of cargos) {
          try {
            await createCargoService(cargo);
            guardadosExito++;
          } catch (error) {
            console.error(`Error al guardar cargo ${cargo.nombre}:`, error);
            guardadosError++;
          }
        }

        if (guardadosError === 0) {
          toast.success(`Proceso finalizado. Se cargaron ${guardadosExito} cargos exitosamente.`, { id: toastId });
          setFile(null);
          fetchCargos();
        } else {
          toast.error(`Proceso finalizado. Se guardaron ${guardadosExito} cargos, pero hubo ${guardadosError} errores.`, { id: toastId });
          fetchCargos();
        }
      } catch (errorGeneral) {
        console.error("Error catastrofico al procesar el archivo:", errorGeneral);
        alert("Ocurrió un error inesperado al leer o procesar el archivo CSV.");
      }
    };
    reader.readAsText(file, "UTF-8");
  };

  const fetchCargos = async () => {
    toast.loading("Buscando...", { id: "search-results" });
    try {
      const response = await getCargos();
      const dataArray = Array.isArray(response) ? response : (response?.data || []);
      setAllCargos(dataArray);
      toast.success(`Se han encontrado resultados`, { id: "search-results" });
    } catch (error) {
      toast.error("Error al cargar los datos", { id: "search-results" });
      console.error(error);
    }
  };

  useEffect(() => {
    fetchCargos();
  }, []);

  useEffect(() => {
    let filtrados = [...allCargos];

    if (filtroNombre) {
      filtrados = filtrados.filter(cargo =>
        cargo.nombre?.toLowerCase().includes(filtroNombre.toLowerCase())
      );
    }

    if (filtroEstado !== "all" && filtroEstado !== null) {
      filtrados = filtrados.filter(cargo =>
        String(cargo.estado) === String(filtroEstado)
      );
    }

    setTotalRecords(filtrados.length);

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    setListadoCargos(filtrados.slice(startIndex, endIndex));
  }, [allCargos, filtroNombre, filtroEstado, page, limit]);

  useEffect(() => {
    if (activeView === "Cargos") {
      console.log("aca");
      fetchCargos();
    }
  }, [activeView]);

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este cargo? Esta acción no se puede deshacer.")) {
      return;
    }

    const toastId = toast.loading("Eliminando cargo...");
    try {
      await deleteCargoService(id);
      toast.success("Cargo eliminado exitosamente", { id: toastId });
      fetchCargos();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error al eliminar el cargo", { id: toastId });
      console.error(error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return dateString.split('T')[0];
  };

  const getTipoCargoNombre = (tipo) => {
    const tipos = {
      1: "Producción",
      2: "Administración",
      3: "Jefatura"
    };
    return tipos[tipo] || tipo || "-";
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
                <Text fontSize={'2xl'} fontWeight="bold">Cargos</Text>
                <Flex gap={3} align="center">
                  <Box position="relative">
                    <input
                      type="file"
                      accept=".csv"
                      style={{
                        position: 'absolute',
                        width: '1px',
                        height: '1px',
                        padding: '0',
                        margin: '-1px',
                        overflow: 'hidden',
                        clip: 'rect(0,0,0,0)',
                        border: '0'
                      }}
                      id="bulk-upload-cargo-input"
                      onChange={(e) => setFile(e.target.files[0])}
                    />
                    <label htmlFor="bulk-upload-cargo-input">
                      <Button
                        as="span"
                        size="sm"
                        variant="subtle"
                        colorPalette="blue"
                        cursor="pointer"
                      >
                        <LuUpload /> {file ? file.name : "Seleccionar CSV"}
                      </Button>
                    </label>
                  </Box>

                  {file && (
                    <Button
                      size="sm"
                      colorPalette="green"
                      onClick={handleUpload}
                    >
                      <LuUpload /> Procesar Carga
                    </Button>
                  )}

                  <Button
                    bg="#7d001c"
                    color="white"
                    _hover={{ bg: "#9a0022" }}
                    onClick={() => setOpenCreate(true)}
                  >
                    Crear Cargo
                  </Button>
                </Flex>
              </Flex>
              <Stack direction={{ base: "column", xl: "row" }} gap="4" align="flex-end" width="full">
                <Field.Root width="250px">
                  <Field.Label fontSize="xs" fontWeight="bold">Nombre del Cargo</Field.Label>
                  <Input
                    type="text"
                    size="sm"
                    placeholder="Buscar cargo..."
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
                    <Table.ColumnHeader textAlign="center">Nombre cargo</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="center">Estado</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="center">Tipo cargo</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="center">Acciones</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {listadoCargos.length > 0 ? (
                    listadoCargos.map((cargo, index) => (
                      <Table.Row key={cargo.cargo_id || index}>
                        <Table.Cell textAlign="center">{cargo.nombre || "-"}</Table.Cell>
                        <Table.Cell textAlign="center">
                          <Flex justify="center" align="center">
                            <Box
                              w="12px"
                              h="12px"
                              borderRadius="full"
                              bg={String(cargo.estado) === "1" ? "green.500" : "red.500"}
                            />
                          </Flex>
                        </Table.Cell>
                        <Table.Cell textAlign="center">{getTipoCargoNombre(cargo.tipo_cargo)}</Table.Cell>
                        {true && (
                          <Table.Cell textAlign="center">
                            <Flex justify="center" gap={2}>
                              <Tooltip content="Gestionar accesos">
                                <IconButton
                                  size="xs"
                                  variant="ghost"
                                  colorPalette="green"
                                  onClick={() => {
                                    setSelectedCargo(cargo);
                                    setOpenAsignar(true);
                                  }}
                                >
                                  <LuMonitorSmartphone />
                                </IconButton>
                              </Tooltip>
                              <Tooltip content="Editar">
                                <IconButton
                                  size="xs"
                                  variant="ghost"
                                  colorPalette="blue"
                                  onClick={() => {
                                    setSelectedCargo(cargo);
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
                                  onClick={() => handleDelete(cargo.cargo_id)}
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
                <Dialog.Title>Nuevo Cargo</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <CreateCargo
                  onSuccess={() => {
                    setOpenCreate(false);
                    fetchCargos();
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
                <Dialog.Title>Editar Cargo</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                {selectedCargo && (
                  <UpdateCargo
                    cargo={selectedCargo}
                    onSuccess={() => {
                      setOpenUpdate(false);
                      fetchCargos();
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

      <Dialog.Root open={openAsignar} onOpenChange={(e) => setOpenAsignar(e.open)} size="xl">
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Asignar Accesos</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                {selectedCargo && (
                  <AsignarAccesosCargo
                    cargo={selectedCargo}
                    onSuccess={() => setOpenAsignar(false)}
                    onCancel={() => setOpenAsignar(false)}
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

