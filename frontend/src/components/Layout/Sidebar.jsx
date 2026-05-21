import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { canAccess } from "../../utils/rbac";

const allMenu = [
  { to: "/", icon: "📊", label: "Dashboard", page: "dashboard" },
  { to: "/entry", icon: "🚗", label: "Kendaraan Masuk", page: "entry" },
  { to: "/exit", icon: "🔍", label: "Kendaraan Keluar", page: "exit" },
  { to: "/vehicles", icon: "📋", label: "Kendaraan Aktif", page: "vehicles" },
  { to: "/cashflow", icon: "💹", label: "Cashflow", page: "cashflow" },
  {
    to: "/lost-tickets",
    icon: "⚠️",
    label: "Karcis Hilang",
    page: "lost-tickets",
  },
  { to: "/users", icon: "👥", label: "User Management", page: "users" },
];

const Sidebar = () => {
  const { user, logout } = useAuth();

  // Filter menu berdasarkan role
  const menu = allMenu.filter((item) => canAccess(user?.role, item.page));

  return (
    <aside className="w-64 bg-gray-900 min-h-screen flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
            P
          </div>
          <div>
            <div className="text-white font-semibold text-sm">
              Smart Parking
            </div>
            <div className="text-gray-400 text-xs">Management System</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <div className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-3 px-2">
          Menu Utama
        </div>
        {menu.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`
            }
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
            {user?.full_name?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-xs font-medium truncate">
              {user?.full_name}
            </div>
            <div className="text-gray-400 text-xs capitalize">{user?.role}</div>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full text-left px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg text-xs transition-colors"
        >
          🚪 Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
