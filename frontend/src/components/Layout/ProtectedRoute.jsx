import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { canAccess } from "../../utils/rbac";

const ProtectedRoute = ({ page, children }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (!canAccess(user.role, page)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="text-6xl mb-4">🚫</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Akses Ditolak</h1>
        <p className="text-gray-400 text-sm mb-6">
          Role <span className="font-semibold text-gray-600">{user.role}</span>{" "}
          tidak memiliki akses ke halaman ini
        </p>
        <a
          href="/"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
        >
          Kembali ke Dashboard
        </a>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
