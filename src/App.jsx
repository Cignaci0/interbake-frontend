import { Toaster } from "react-hot-toast"
import { Router, Route, Switch, Redirect } from "wouter"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"

function PrivateRoute({ component: Component, ...rest }) {
  const isAuthenticated = !!localStorage.getItem("token")
  return (
    <Route {...rest}>
      {isAuthenticated ? <Component /> : <Redirect to="/" />}
    </Route>
  )
}

function App() {
  return (
    <>
      <Toaster />
      <Router>
        <Switch>
          <Route path="/">
            {() => {
              const isAuthenticated = !!localStorage.getItem("token")
              return isAuthenticated ? <Redirect to="/dashboard" /> : <Login />
            }}
          </Route>
          
          <PrivateRoute path="/dashboard" component={Dashboard} />

          <Route>
            <Redirect to="/" />
          </Route>
        </Switch>
      </Router>
    </>
  )
}

export default App
