import { Box, Button, Card, Container, Field, Input, Stack, Text } from "@chakra-ui/react"
import { useState } from "react";
import { useLocation } from "wouter";
import loginService from "../services/loginService";
import toast from "react-hot-toast";

function Login() {
  const [, setLocation] = useLocation();
  const [usuario, setUsuario] = useState("");
  const [contrasenia, setContrasenia] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!usuario || !contrasenia) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    setLoading(true);
    loginService({ usuario, contrasenia })
      .then(() => {
        toast.success("Inicio de sesión exitoso");
        setLocation("/dashboard");
      })
      .catch((error) => {
        console.error(error);
        toast.error(error.response?.data?.message || "Error al iniciar sesión");
      })
      .finally(() => {
        setLoading(false);
      });
  }

  return (
    <>
      <Container
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minH="100vh" // Esto fuerza que el contenedor ocupe toda la pantalla verticalmente
        maxW="full"  // Evita que el Container limite el ancho antes de tiempo
      >
        <Card.Root width="full" maxW="sm">
          <Box p={14}>
            <img src="interbake.png" />
          </Box>
          <hr />
          {/* width="full" asegura que use el máximo permitido por maxW sin encogerse de más */}
          <form onSubmit={handleSubmit}>
            <Card.Body>
              <Stack gap={4} w="full">
                <Field.Root required>
                  <Field.Label>
                    Usuario <Field.RequiredIndicator />
                  </Field.Label>
                  <Input
                    placeholder="Ingresa tu usuario"
                    autoComplete="off"
                    value={usuario}
                    onChange={(e) => setUsuario(e.target.value)}
                  />
                </Field.Root>
                <Field.Root required>
                  <Field.Label>
                    Contraseña <Field.RequiredIndicator />
                  </Field.Label>
                  <Input
                    type="password"
                    placeholder="Ingresa tu contraseña"
                    autoComplete="off"
                    value={contrasenia}
                    onChange={(e) => setContrasenia(e.target.value)}
                  />
                </Field.Root>
              </Stack>
            </Card.Body>
            <Card.Footer justifyContent="flex-end">
              <Button type="submit" variant="solid" loading={loading}>Iniciar sesión</Button>
            </Card.Footer>
          </form>
          <hr />
          <Text px={4} py={2} textAlign={'center'} fontSize={'sm'} fontWeight={'semibold'}>FEMASE - 2026</Text>
        </Card.Root>
      </Container>

    </>
  )
}

export default Login;
