import {
  Box,
  Button,
  ButtonGroup,
  Card,
  CloseButton,
  createListCollection,
  Dialog,
  Field,
  FileUpload,
  Flex,
  IconButton,
  Icon,
  Input,
  List,
  Pagination,
  Portal,
  Select,
  Stack,
  Table,
  Text,
  Textarea
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { LuChevronLeft, LuChevronRight, LuUpload, LuX, LuDownload, LuPencil, LuTrash2, LuMail, LuKey } from "react-icons/lu";
import { IoWarning } from "react-icons/io5";

import getEmpleados from "../services/getEmpleados";
import getCargos from "../services/getCargos";
import getCencos from "../services/getCencos";
import createEmpleadoService from "../services/createEmpleado";
import deleteEmpleadoService from "../services/deleteEmpleado";
import toast from "react-hot-toast";
import { BiDetail } from "react-icons/bi";
import { Tooltip } from "../components/ui/tooltip"
import CreateEmpleado from "../components/CreateEmpleado";
import UpdateEmpleado from "../components/UpdateEmpleado";
import AsignarAccesosEspeciales from "../components/AsignarAccesosEspeciales";
// import deletePagoBasicoService from "../services/deletePagoBasicoService";x

export default function Empleados({ activeView }) {
  const [listadoEmpleados, setListadoEmpleados] = useState([]);
  const [allEmpleados, setAllEmpleados] = useState([]);
  const [cargosCollection, setCargosCollection] = useState(createListCollection({ items: [] }));
  const [cencosCollection, setCencosCollection] = useState(createListCollection({ items: [] }));
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [totalRecords, setTotalRecords] = useState(0);
  const [file, setFile] = useState(null);

  const [filtroNombre, setFiltroNombre] = useState("");

  const [openCreate, setOpenCreate] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [selectedEmpleado, setSelectedEmpleado] = useState(null);


  const [filtroTipo, setFiltroTipo] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState(null);

  const [selectedEmpleadoEmails, setSelectedEmpleadoEmails] = useState(null);
  const [openEmails, setOpenEmails] = useState(false);
  const [openAccesosEspeciales, setOpenAccesosEspeciales] = useState(false);

  const [range, setRange] = useState({
    start: "",
    end: ""
  });

  const handleChange = (e) => {
    setRange({
      ...range,
      [e.target.name]: e.target.value
    });
  };

  const getListadoEmpleados = async () => {
    toast.loading("Buscando empleados...", { id: "search-results" });

    try {
      // Fetching maximum amount to allow local filtering and pagination, matching other modules
      const result = await getEmpleados(1, 9999);

      const empleados = result.data || result || [];
      const total = result.meta?.total || empleados.length || 0;

      setAllEmpleados(empleados);
      setTotalRecords(total);

      toast.success(`Se han encontrado resultados`, {
        id: "search-results",
      });
    } catch (error) {
      toast.error("Error al cargar los empleados", { id: "search-results" });
      console.error(error);
    }
  };

  const fetchFiltersData = async () => {
    try {
      const [respCargos, respCencos] = await Promise.all([
        getCargos(),
        getCencos()
      ]);

      const dataCargos = Array.isArray(respCargos) ? respCargos : (respCargos?.data || []);
      const dataCencos = Array.isArray(respCencos) ? respCencos : (respCencos?.data || []);

      const formattedCargos = [
        { label: "Todos los cargos", value: "all" },
        ...dataCargos.map((item) => ({
          label: item.nombre,
          value: item.cargo_id.toString(),
        })),
      ];

      const formattedCencos = [
        { label: "Todos los centros", value: "all" },
        ...dataCencos.map((item) => ({
          label: item.nombre,
          value: item.cenco_id.toString(),
        })),
      ];

      setCargosCollection(createListCollection({ items: formattedCargos }));
      setCencosCollection(createListCollection({ items: formattedCencos }));
    } catch (error) {
      console.error("Error cargando filtros:", error);
    }
  };

  useEffect(() => {
    fetchFiltersData();
  }, []);

  useEffect(() => {
    let filtrados = [...allEmpleados];

    if (filtroNombre) {
      const lowerQuery = filtroNombre.toLowerCase();
      filtrados = filtrados.filter(empleado => {
        const full = `${empleado.nombres} ${empleado.apellido_paterno} ${empleado.apellido_materno || ""}`.toLowerCase();
        return full.includes(lowerQuery);
      });
    }

    if (filtroTipo !== "all" && filtroTipo !== null) {
      // filtroTipo = Cenco
      filtrados = filtrados.filter(empleado =>
        String(empleado.cenco_id?.cenco_id) === String(filtroTipo)
      );
    }

    if (filtroEstado !== "all" && filtroEstado !== null) {
      // filtroEstado = Cargo
      filtrados = filtrados.filter(empleado =>
        String(empleado.cargo_id?.cargo_id) === String(filtroEstado)
      );
    }

    setTotalRecords(filtrados.length);

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    setListadoEmpleados(filtrados.slice(startIndex, endIndex));
  }, [allEmpleados, filtroTipo, filtroEstado, filtroNombre, page, limit]);

  useEffect(() => {
    if (activeView === "Empleados") {
      getListadoEmpleados();
    }
  }, [activeView]);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return dateString.split('T')[0];
  };

  const handleLimpiarFiltros = () => {
    setFiltroNombre("");
    setFiltroTipo("all");
    setFiltroEstado("all");
    setPage(1);
  };

  const limites = createListCollection({
    items: [
      { label: '5', value: 5 },
      { label: '10', value: 10 },
      { label: '15', value: 15 },
      { label: '20', value: 20 }
    ]
  });

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

        const parseDate = (dateStr) => {
          if (!dateStr) return null;
          const str = dateStr.trim();
          if (str.includes('-')) {
            const parts = str.split('-');
            if (parts[0].length === 4) return str;
            if (parts[2].length === 4) return `${parts[2]}-${parts[1]}-${parts[0]}`;
          }
          if (str.includes('/')) {
            const parts = str.split('/');
            if (parts[0].length === 4) return `${parts[0]}-${parts[1]}-${parts[2]}`;
            if (parts[2].length === 4) return `${parts[2]}-${parts[1]}-${parts[0]}`;
          }
          return str;
        };

        const parseBoolean = (val) => val?.trim().toLowerCase() === "true" || val?.trim() === "1";

        const empleados = lines.slice(1).map((line) => {
          const columns = line.split(";");
          if (columns.length < 2) return null;
          return {
            run: columns[0]?.trim(),
            nombres: columns[1]?.trim(),
            apellido_paterno: columns[2]?.trim(),
            apellido_materno: columns[3]?.trim(),
            fecha_nacimiento: parseDate(columns[4]),
            direccion: columns[5]?.trim(),
            email: columns[6]?.trim(),
            sexo: columns[7]?.trim(),
            telefono_fijo: columns[8]?.trim() ? parseInt(columns[8].trim()) : 0,
            telefono_movil: columns[9]?.trim() ? parseInt(columns[9].trim()) : null,
            comuna: columns[10]?.trim(),
            fecha_ini_contrato: parseDate(columns[11]),
            contrato_indefinido: parseBoolean(columns[12]),
            fecha_fin_contrato: parseDate(columns[13]),
            art_22: parseBoolean(columns[14]),
            autoriza_ausencia: parseBoolean(columns[15]),
            clave: columns[16]?.trim() || "1234",
            // Mapping to the object structure expected by backend/service
            cargo_id: columns[18]?.trim() ? { cargo_id: parseInt(columns[18].trim()) } : null,
            email_laboral: columns[21]?.trim(),
            num_ficha: columns[22]?.trim(),
            cenco_id: columns[23]?.trim() ? { cenco_id: parseInt(columns[23].trim()) } : null,
            email_noti: columns[21]?.trim(), // Defaulting to laboral if not separate in user CSV logic
            estado: 1
          };
        }).filter(emp => emp && emp.run);

        if (empleados.length === 0) {
          alert("El archivo CSV está vacío o no tiene el formato correcto.");
          return;
        }

        let guardadosExito = 0;
        let guardadosError = 0;

        toast.loading("Procesando carga masiva...", { id: "bulk-load" });

        for (const empleado of empleados) {
          try {
            await createEmpleadoService(empleado);
            guardadosExito++;
          } catch (error) {
            console.error(`Error al guardar empleado ${empleado.run}:`, error);
            guardadosError++;
          }
        }

        if (guardadosError === 0) {
          toast.success(`Proceso finalizado. Se cargaron ${guardadosExito} empleados exitosamente.`, { id: "bulk-load" });
          setFile(null);
          getListadoEmpleados();
        } else {
          toast.error(`Proceso finalizado. Se guardaron ${guardadosExito} empleados, pero hubo ${guardadosError} errores.`, { id: "bulk-load" });
          getListadoEmpleados();
        }
      } catch (errorGeneral) {
        console.error("Error catastrofico al procesar el archivo:", errorGeneral);
        toast.error("Ocurrió un error inesperado al leer o procesar el archivo CSV.", { id: "bulk-load" });
      }
    };
    reader.readAsText(file, "UTF-8");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este empleado? Esta acción no se puede deshacer.")) {
      return;
    }

    const toastId = toast.loading("Eliminando empleado...");
    try {
      await deleteEmpleadoService(id);
      toast.success("Empleado eliminado exitosamente", { id: toastId });
      getListadoEmpleados();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error al eliminar el empleado", { id: toastId });
      console.error(error);
    }
  };

  return (
    <>
      <Flex
        direction="column"
        overflow="hidden"
        height="100%"
        bg="gray.50"
        w="full"
      >
        <Flex
          direction="column"
          flex="1"
          p={2}
          minH={0}
          overflow="hidden"
        >
          <Box mb={4} flexShrink={0}>
            <Card.Root p={6}>
              <Flex justify="space-between" align="center" mb={4}>
                <Text fontSize={'2xl'} fontWeight="bold">Empleados</Text>
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
                      id="bulk-upload-input"
                      onChange={(e) => setFile(e.target.files[0])}
                    />
                    <label htmlFor="bulk-upload-input">
                      <Button
                        as="span"
                        size="sm"
                        variant="subtle"
                        colorPalette="blue"
                        cursor="pointer"
                        leftIcon={<LuUpload />}
                      >
                        {file ? file.name : "Seleccionar CSV"}
                      </Button>
                    </label>
                  </Box>
                  
                  {file && (
                    <Button
                      size="sm"
                      colorPalette="green"
                      onClick={handleUpload}
                      leftIcon={<LuUpload />}
                    >
                      Procesar Carga
                    </Button>
                  )}

                  <Button
                    bg="#7d001c"
                    color="white"
                    _hover={{ bg: "#9a0022" }}
                    onClick={() => setOpenCreate(true)}
                  >
                    Crear Empleado
                  </Button>
                </Flex>
              </Flex>
              <Stack direction={{ base: "column", xl: "row" }} gap="4" align="flex-end" width="full">
                {/* Filtro Nombre */}
                <Field.Root width="250px">
                  <Field.Label fontSize="xs" fontWeight="bold">Nombre</Field.Label>
                  <Input
                    type="text"
                    name="nombre"
                    size="sm"
                    autoComplete="off"
                    placeholder="Juan Perez"
                    value={filtroNombre}
                    onChange={(e) => setFiltroNombre(e.target.value)}
                  />
                </Field.Root>                {/* Filtro Centro de costo */}
                <Field.Root width="250px">
                  <Field.Label fontSize="xs" fontWeight="bold">Centro de costo</Field.Label>
                  <Select.Root
                    onValueChange={(details) => {
                      setFiltroTipo(details.value[0]);
                      setPage(1);
                    }}
                    value={filtroTipo !== null ? [filtroTipo] : []}
                    collection={cencosCollection}
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
                          {cencosCollection.items.map((tipo) => (
                            <Select.Item item={tipo} key={tipo.value}>{tipo.label}</Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Positioner>
                    </Portal>
                  </Select.Root>
                </Field.Root>

                {/* Filtro Cargo */}
                <Field.Root width="200px">
                  <Field.Label fontSize="xs" fontWeight="bold">Cargo</Field.Label>
                  <Select.Root
                    onValueChange={(details) => {
                      setFiltroEstado(details.value[0]);
                      setPage(1);
                    }}
                    value={filtroEstado !== null ? [filtroEstado] : []}
                    collection={cargosCollection}
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
                          {cargosCollection.items.map((estado) => (
                            <Select.Item item={estado} key={estado.value}>{estado.label}</Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Positioner>
                    </Portal>
                  </Select.Root>
                </Field.Root>


                {/* Botón Limpiar Filtros */}
                <Button variant="outline" size="sm" onClick={handleLimpiarFiltros}>
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
            <Box
              flex={1}
              overflow={'auto'}
            >
              <Table.Root variant="outline" stickyHeader striped size="sm" width="full">
                <Table.Header>
                  <Table.Row bg="gray.50">
                    <Table.ColumnHeader textAlign="center">Num Ficha</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="center">Nombre</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="center">RUT</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="start">Cargo</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="center">Cenco</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="center">Emails</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="center">Acciones</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {listadoEmpleados.length > 0 ? (
                    listadoEmpleados.map((empleado) => (
                      <Table.Row key={empleado.empleado_id}>
                        <Table.Cell textAlign="center">{empleado.num_ficha || "-"}</Table.Cell>
                        <Table.Cell textAlign="center">
                          {`${empleado.nombres} ${empleado.apellido_paterno} ${empleado.apellido_materno || ""}`}
                        </Table.Cell>
                        <Table.Cell textAlign="center">{empleado.run}</Table.Cell>
                        <Table.Cell textAlign="start">{empleado.cargo_id?.nombre || "-"}</Table.Cell>
                        <Table.Cell textAlign="center">{empleado.cenco_id?.nombre || "-"}</Table.Cell>
                        <Table.Cell textAlign="center">
                          <IconButton
                            size="xs"
                            variant="subtle"
                            colorPalette="blue"
                            onClick={() => {
                              setSelectedEmpleadoEmails(empleado);
                              setOpenEmails(true);
                            }}
                          >
                            <LuMail />
                          </IconButton>
                        </Table.Cell>
                        <Table.Cell textAlign={'center'}>
                          <Flex gap={2} justify="center">
                            <Tooltip content="Editar empleado">
                              <IconButton
                                size="xs"
                                variant="ghost"
                                colorPalette="blue"
                                onClick={() => {
                                  setSelectedEmpleado(empleado);
                                  setOpenUpdate(true);
                                }}
                              >
                                <LuPencil />
                              </IconButton>
                            </Tooltip>
                            <Tooltip content="Accesos especiales">
                              <IconButton
                                size="xs"
                                variant="ghost"
                                colorPalette="yellow"
                                onClick={() => {
                                  setSelectedEmpleado(empleado);
                                  setOpenAccesosEspeciales(true);
                                }}
                              >
                                <LuKey />
                              </IconButton>
                            </Tooltip>
                            <Tooltip content="Eliminar empleado">
                              <IconButton
                                size="xs"
                                variant="ghost"
                                colorPalette="red"
                                onClick={() => handleDelete(empleado.empleado_id)}
                              >
                                <LuTrash2 />
                              </IconButton>
                            </Tooltip>
                          </Flex>
                        </Table.Cell>
                      </Table.Row>
                    ))
                  ) : (
                    <Table.Row>
                      <Table.Cell colSpan={7} textAlign="center" py={10} color="gray.500">
                        No se encontraron empleados.
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
                <Select.HiddenSelect />
                <Select.Control>
                  <Select.Trigger>
                    <Select.ValueText placeholder="10" />
                  </Select.Trigger>
                  <Select.IndicatorGroup>
                    <Select.Indicator />
                  </Select.IndicatorGroup>
                </Select.Control>
                <Portal>
                  <Select.Positioner>
                    <Select.Content>
                      {
                        limites.items.map(limite => (
                          <Select.Item item={limite} key={limite.value}>
                            {limite.label}
                          </Select.Item>
                        ))
                      }
                    </Select.Content>
                  </Select.Positioner>
                </Portal>
              </Select.Root>
            </Flex>
          </Flex>
        </Flex>
      </Flex >
      <Dialog.Root
        open={openCreate}
        onOpenChange={(e) => setOpenCreate(e.open)}
        size="xl"
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Nuevo Empleado</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <CreateEmpleado
                  onSuccess={() => {
                    setOpenCreate(false);
                    getListadoEmpleados();
                  }}
                  onCancel={() => setOpenCreate(false)}
                />
              </Dialog.Body>
              <Dialog.CloseTrigger />
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
      <Dialog.Root
        open={openUpdate}
        onOpenChange={(e) => setOpenUpdate(e.open)}
        size="xl"
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Editar Empleado</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                {selectedEmpleado && (
                  <UpdateEmpleado
                    empleado={selectedEmpleado}
                    onSuccess={() => {
                      setOpenUpdate(false);
                      getListadoEmpleados();
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

      <Dialog.Root
        open={openEmails}
        onOpenChange={(e) => setOpenEmails(e.open)}
        size="md"
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Correos Electrónicos</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                {selectedEmpleadoEmails && (
                  <Stack gap={4}>
                    <Box p={3} borderRadius="md" bg="blue.50">
                      <Text fontWeight="bold" fontSize="xs" color="blue.600">Email Personal</Text>
                      <Text>{selectedEmpleadoEmails.email || "No registrado"}</Text>
                    </Box>
                    <Box p={3} borderRadius="md" bg="green.50">
                      <Text fontWeight="bold" fontSize="xs" color="green.600">Email Laboral</Text>
                      <Text>{selectedEmpleadoEmails.email_laboral || "No registrado"}</Text>
                    </Box>
                    <Box p={3} borderRadius="md" bg="purple.50">
                      <Text fontWeight="bold" fontSize="xs" color="purple.600">Email Notificaciones</Text>
                      <Text>{selectedEmpleadoEmails.email_noti || "No registrado"}</Text>
                    </Box>
                  </Stack>
                )}
              </Dialog.Body>
              <Dialog.CloseTrigger />
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      <Dialog.Root open={openAccesosEspeciales} onOpenChange={(e) => setOpenAccesosEspeciales(e.open)} size="xl">
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Asignar Accesos Especiales</Dialog.Title>
                <Text fontSize="sm" color="gray.500">
                  {selectedEmpleado ? `${selectedEmpleado.nombres} ${selectedEmpleado.apellido_paterno}` : ""}
                </Text>
              </Dialog.Header>
              <Dialog.Body>
                {selectedEmpleado && (
                  <AsignarAccesosEspeciales
                    empleado={selectedEmpleado}
                    onCancel={() => setOpenAccesosEspeciales(false)}
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