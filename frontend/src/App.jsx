import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout/Layout";
import ProtectedRoute from "./components/Layout/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import VehicleEntry from "./pages/VehicleEntry";
import VehicleExit from "./pages/VehicleExit";
import ActiveVehicles from "./pages/ActiveVehicles";
import UserManagement from "./pages/UserManagement";
import LostTicket from "./pages/LostTicket";
import Cashflow from "./pages/Cashflow";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<Layout />}>
            <Route
              path="/"
              element={
                <ProtectedRoute page="dashboard">
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/entry"
              element={
                <ProtectedRoute page="entry">
                  <VehicleEntry />
                </ProtectedRoute>
              }
            />
            <Route
              path="/exit"
              element={
                <ProtectedRoute page="exit">
                  <VehicleExit />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vehicles"
              element={
                <ProtectedRoute page="vehicles">
                  <ActiveVehicles />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute page="users">
                  <UserManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lost-tickets"
              element={
                <ProtectedRoute page="lost-tickets">
                  <LostTicket />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cashflow"
              element={
                <ProtectedRoute page="cashflow">
                  <Cashflow />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
