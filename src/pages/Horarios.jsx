import {
  Box,
  Button,
  ButtonGroup,
  Card,
  createListCollection,
  Flex,
  IconButton,
  Pagination,
  Portal,
  Select,
  Stack,
  Table,
  Text,
  Dialog
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { LuChevronLeft, LuChevronRight, LuPencil, LuTrash2 } from "react-icons/lu";
import toast from "react-hot-toast";
import CreateHorario from "../components/CreateHorario";
import UpdateHorario from "../components/UpdateHorario";
import { Tooltip } from "../components/ui/tooltip";
import getHorarios from "../services/getHorarios";
import deleteHorarioService from "../services/deleteHorario";

export default function Horarios({ activeView }) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [totalRecords, setTotalRecords] = useState(0);
  const [openCreate, setOpenCreate] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [selectedHorario, setSelectedHorario] = useState(null);

  const [listadoHorarios, setListadoHorarios] = useState([]);
  const [allHorarios, setAllHorarios] = useState([]);

  const limpiarFiltros = () => {
    setPage(1);
  };

  const fetchHorarios = async () => {
    toast.loading("Buscando...", { id: "search-results" });
    try {
      const response = await getHorarios();
      const dataArray = Array.isArray(response) ? response : (response?.data || []);
      setAllHorarios(dataArray);
      toast.success(`Se han encontrado resultados`, { id: "search-results" });
    } catch (error) {
      toast.error("Error al cargar los datos", { id: "search-results" });
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este horario? Esta acción no se puede deshacer.")) {
      return;
    }

    const toastId = toast.loading("Eliminando horario...");
    try {
      await deleteHorarioService(id);
      toast.success("Horario eliminado exitosamente", { id: toastId });
      fetchHorarios();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error al eliminar el horario", { id: toastId });
      console.error(error);
    }
  };

  useEffect(() => {
    fetchHorarios();
  }, []);

  useEffect(() => {
    let filtrados = [...allHorarios];

    setTotalRecords(filtrados.length);

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    setListadoHorarios(filtrados.slice(startIndex, endIndex));
  }, [allHorarios, page, limit]);

  useEffect(() => {
    if (activeView === "Horarios") {
      fetchHorarios();
    }
  }, [activeView]);

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
                <Text fontSize={'2xl'} fontWeight="bold">Horarios</Text>
                {true && (
                  <Button
                    bg="#7d001c"
                    color="white"
                    _hover={{ bg: "#7d001c" }}
                    onClick={() => setOpenCreate(true)}
                  >
                    Crear Horario
                  </Button>
                )}
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
                    <Table.ColumnHeader textAlign="center">ID Horario</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="center">Hora Entrada</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="center">Hora Salida</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="center">Holgura Mins</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="center">Acciones</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {listadoHorarios.length > 0 ? (
                    listadoHorarios.map((horario, index) => (
                      <Table.Row key={horario.horario_id || index}>
                        <Table.Cell textAlign="center">{horario.horario_id || "-"}</Table.Cell>
                        <Table.Cell textAlign="center">{horario.hora_entrada || "-"}</Table.Cell>
                        <Table.Cell textAlign="center">{horario.hora_salida || "-"}</Table.Cell>
                        <Table.Cell textAlign="center">{horario.holgura_mins || "-"}</Table.Cell>
                        {true && (
                          <Table.Cell textAlign="center">
                            <Flex justify="center" gap={2}>
                              <Tooltip content="Editar">
                                <IconButton
                                  size="xs"
                                  variant="ghost"
                                  colorPalette="blue"
                                  onClick={() => {
                                    setSelectedHorario(horario);
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
                                  onClick={() => handleDelete(horario.horario_id || horario.id)}
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
                      <Table.Cell colSpan={5} textAlign="center" py={10} color="gray.500">
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
                <Dialog.Title>Nuevo Horario</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <CreateHorario
                  onSuccess={() => {
                    setOpenCreate(false);
                    fetchHorarios();
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
                <Dialog.Title>Editar Horario</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                {selectedHorario && (
                  <UpdateHorario
                    horario={selectedHorario}
                    onSuccess={() => {
                      setOpenUpdate(false);
                      fetchHorarios();
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