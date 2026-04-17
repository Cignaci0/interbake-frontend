import { Box, Button, Dialog, Flex, IconButton, Portal, Stack, Text } from "@chakra-ui/react"

import { useLocation } from "wouter"
import Empleados from "./Empleados"
import { useEffect, useState } from "react"
import { BiLogOut, BiUser } from "react-icons/bi"
import { LuChevronLeft, LuChevronRight } from "react-icons/lu"


import { Tooltip } from "../components/ui/tooltip"
import Cargos from "./Cargos"
import Accesos from "./Accesos"
import Horarios from "./Horarios"
import Turnos from "./Turnos"


function Dashboard() {
  const [, setLocation] = useLocation();
  const [activeView, setActiveView] = useState("Empleados")
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)


  const [menus] = useState([
    { nombre_pagina: "Empleados" },
    { nombre_pagina: "Cargos" },
    { nombre_pagina: "Accesos" },
    { nombre_pagina: "Horarios" },
    { nombre_pagina: "Turnos" }
  ]);

  const handleLogoutConfirm = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("username")
    setShowLogoutDialog(false)
    setLocation("/")
  }

  // Menús estáticos configurados arriba

  return (
    <>
      {/* Barra superior */}
      <Box py={4} bg={'#7d001c'} color={'white'} px={8}>
        <Box>
          <Flex justify={'space-between'}>
            <Text fontWeight={'semibold'} fontSize={'lg'}>Sistema de control de acceso</Text>
          </Flex>
        </Box>
      </Box>

      {/* Contenedor principal ajustado */}
      <Flex h="calc(100vh - 60px)" w="full" overflow="hidden">
        {/* Sidebar / Drawer */}
        <Box
          as="aside"
          display="flex"
          flexDirection="column"
          w={isSidebarCollapsed ? "80px" : "250px"}
          h="full"
          borderRight="1px solid"
          borderColor="gray.200"
          p={isSidebarCollapsed ? 2 : 4}
          bg="white"
          transition="width 0.3s ease-in-out, padding 0.3s ease-in-out"
          position="relative"
        >
          {/* Botón para colapsar */}
          <IconButton
            position="absolute"
            right="-15px"
            top="20px"
            size="xs"
            variant="outline"
            borderRadius="full"
            bg="white"
            borderColor="gray.200"
            zIndex={10}
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            _hover={{ bg: "blue.50", borderColor: "blue.300" }}
            boxShadow="md"
            color="blue.700"
          >
            {isSidebarCollapsed ? <LuChevronRight size="18px" /> : <LuChevronLeft size="18px" />}
          </IconButton>


          <Stack gap={2} flex="1" mt={4}>
            {menus.map((menu) => (
              <Tooltip
                key={menu.nombre_pagina}
                content={menu.nombre_pagina}
                disabled={!isSidebarCollapsed}
                placement="right"
              >
                <Button
                  variant={activeView === (menu.nombre_pagina) ? "solid" : "ghost"}
                  justifyContent={isSidebarCollapsed ? "center" : "flex-start"}
                  onClick={() => setActiveView(menu.nombre_pagina)}
                  transition="all 0.15s ease-in-out"
                  px={isSidebarCollapsed ? 0 : 4}
                  overflow="hidden"
                >
                  <Box flexShrink={0} display="flex" alignItems="center" fontSize="xl">
                    {/* Generar un icono genérico o la inicial si no hay icono */}
                    <Box w="24px" h="24px" fontWeight="bold" fontSize="xs" bg="gray.100" borderRadius="md" display="flex" alignItems="center" justifyContent="center" color="blue.700">
                      {menu.nombre_pagina.includes("Basico") ? "B" : menu.nombre_pagina.includes("Nomina") ? "N" : menu.nombre_pagina.charAt(0)}
                    </Box>
                  </Box>
                  {!isSidebarCollapsed && (
                    <Text ml={3} truncate>
                      {menu.nombre_pagina}
                    </Text>
                  )}
                </Button>
              </Tooltip>
            ))}
          </Stack>

          <hr />

          <Box py={4} display="flex" justifyContent="center">
            <img
              src="interbake.png"
              alt="Logo"
              style={{
                maxWidth: isSidebarCollapsed ? "40px" : "150px",
                transition: "max-width 0.3s ease-in-out"
              }}
            />
          </Box>


          <Box
            mt="auto"
            pt={4}
            borderTop="1px solid"
            borderColor="gray.100"
          >
            <Tooltip content="Cerrar sesión" disabled={!isSidebarCollapsed} placement="right">
              <Button
                variant="subtle"
                colorPalette="red"
                w="full"
                justifyContent={isSidebarCollapsed ? "center" : "flex-start"}
                onClick={() => setShowLogoutDialog(true)}
                px={isSidebarCollapsed ? 0 : 4}
              >
                <BiLogOut />
                {!isSidebarCollapsed && <Text ml={3}>Cerrar sesión</Text>}
              </Button>
            </Tooltip>
          </Box>

        </Box>

        {/* Contenido Principal con scroll independiente */}
        <Box position="relative" flex="1" overflow="hidden">
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            opacity={activeView === "Empleados" ? 1 : activeView === "Ingreso Pago Basico" ? 1 : 0}
            pointerEvents={activeView === "Empleados" ? "auto" : activeView === "Ingreso Pago Basico" ? "auto" : "none"}
            transition="opacity 0.2s ease-in-out"
            w="full"
            h="full"
          >
            <Empleados activeView={activeView} />
          </Box>
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            opacity={activeView === "Accesos" || activeView === "Detalle Acceso" ? 1 : 0}
            pointerEvents={activeView === "Accesos" || activeView === "Detalle Acceso" ? "auto" : "none"}
            transition="opacity 0.2s ease-in-out"
            w="full"
            h="full"
          >
            <Accesos activeView={activeView} />
          </Box>
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            opacity={activeView === "Cargos" ? 1 : 0}
            pointerEvents={activeView === "Cargos" ? "auto" : "none"}
            transition="opacity 0.2s ease-in-out"
            w="full"
            h="full"
          >
            <Cargos activeView={activeView} />
          </Box>
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            opacity={activeView === "Horarios" ? 1 : 0}
            pointerEvents={activeView === "Horarios" ? "auto" : "none"}
            transition="opacity 0.2s ease-in-out"
            w="full"
            h="full"
          >
            <Horarios activeView={activeView} />
          </Box>
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            opacity={activeView === "Turnos" ? 1 : 0}
            pointerEvents={activeView === "Turnos" ? "auto" : "none"}
            transition="opacity 0.2s ease-in-out"
            w="full"
            h="full"
          >
            <Turnos activeView={activeView} />
          </Box>
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            opacity={activeView === "Solicitud Pago" ? 1 : 0}
            pointerEvents={activeView === "Solicitud Pago" ? "auto" : "none"}
            transition="opacity 0.2s ease-in-out"
            w="full"
            h="full"
          >
            {/* <GeneracionSolicitud activeView={activeView} /> */}
          </Box>
        </Box>
      </Flex>

      {/* Dialog de confirmación de cierre de sesión */}
      <Dialog.Root
        open={showLogoutDialog}
        onOpenChange={(e) => setShowLogoutDialog(e.open)}
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Confirmar cierre de sesión</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <Text>¿Estás seguro de que deseas cerrar sesión?</Text>
              </Dialog.Body>
              <Dialog.Footer>
                <Dialog.ActionTrigger asChild>
                  <Button variant="outline">Cancelar</Button>
                </Dialog.ActionTrigger>
                <Button
                  colorPalette="red"
                  onClick={handleLogoutConfirm}
                >
                  Cerrar sesión
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  )
}

export default Dashboard
