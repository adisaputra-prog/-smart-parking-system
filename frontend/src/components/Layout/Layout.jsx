// components/Layout/Layout.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "./Sidebar";
import LoadingSpinner from "../UI/LoadingSpinner";

const Layout = () => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner text="Memuat aplikasi..." />;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
