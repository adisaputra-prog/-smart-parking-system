import { useState, useEffect } from "react";
import api from "../services/api";
import LoadingSpinner from "../components/UI/LoadingSpinner";
import { useAuth } from "../context/AuthContext";

const ROLES = [
  {
    value: "admin",
    label: "Admin",
    desc: "Kelola sistem",
    color: "bg-blue-100 text-blue-700",
  },
  {
    value: "operator",
    label: "Operator",
    desc: "Scan & input tiket",
    color: "bg-green-100 text-green-700",
  },
  {
    value: "supervisor",
    label: "Supervisor",
    desc: "Approve lost ticket",
    color: "bg-amber-100 text-amber-700",
  },
  {
    value: "teknisi",
    label: "Teknisi",
    desc: "Maintenance sistem",
    color: "bg-orange-100 text-orange-700",
  },
  {
    value: "cashier",
    label: "Cashier",
    desc: "Proses pembayaran",
    color: "bg-teal-100 text-teal-700",
  },
];

const getRoleColor = (role) => {
  const found = ROLES.find((r) => r.value === role);
  return found ? found.color : "bg-gray-100 text-gray-600";
};

const emptyForm = {
  username: "",
  password: "",
  full_name: "",
  email: "",
  role: "operator",
};

const UserManagement = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data.data);
    } catch (err) {
      setError("Gagal memuat data user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openCreate = () => {
    setForm(emptyForm);
    setEditId(null);
    setError("");
    setShowForm(true);
  };

  const openEdit = (u) => {
    setForm({
      username: u.username,
      full_name: u.full_name,
      email: u.email || "",
      role: u.role,
      password: "",
    });
    setEditId(u.id);
    setError("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditId(null);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      if (editId) {
        await api.put(`/users/${editId}`, form);
        setSuccess("User berhasil diupdate");
      } else {
        await api.post("/users", form);
        setSuccess("User berhasil dibuat");
      }
      closeForm();
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (userId, username) => {
    if (!window.confirm(`Nonaktifkan user "${username}"?`)) return;
    try {
      await api.delete(`/users/${userId}`);
      setSuccess(`User ${username} berhasil dinonaktifkan`);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Gagal menonaktifkan user");
    }
  };

  if (loading) return <LoadingSpinner text="Memuat data user..." />;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-400 text-sm mt-1">
            Kelola akun dan role pengguna sistem parkir
          </p>
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors font-medium"
        >
          + Tambah User
        </button>
      </div>

      {/* Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-sm mb-4">
          ⚠️ {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-600 rounded-lg px-4 py-3 text-sm mb-4">
          ✅ {success}
        </div>
      )}

      {/* Role Legend */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {ROLES.map((r) => (
          <div
            key={r.value}
            className="bg-white rounded-lg border border-gray-100 p-3 text-center shadow-sm"
          >
            <span
              className={`inline-block px-2 py-1 rounded-full text-xs font-medium mb-1 ${r.color}`}
            >
              {r.label}
            </span>
            <p className="text-xs text-gray-400">{r.desc}</p>
          </div>
        ))}
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">
                {editId ? "✏️ Edit User" : "➕ Tambah User Baru"}
              </h2>
              <button
                onClick={closeForm}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-sm mb-4">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) =>
                    setForm({ ...form, username: e.target.value })
                  }
                  disabled={!!editId}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
                  placeholder="contoh: operator_pagi"
                  required={!editId}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={form.full_name}
                  onChange={(e) =>
                    setForm({ ...form, full_name: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="contoh: Budi Santoso"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email{" "}
                  <span className="text-gray-400 font-normal">(opsional)</span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="budi@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password{" "}
                  {editId && (
                    <span className="text-gray-400 font-normal">
                      (kosongkan jika tidak diubah)
                    </span>
                  )}
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={
                    editId
                      ? "Kosongkan jika tidak diubah"
                      : "Minimal 6 karakter"
                  }
                  required={!editId}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <div className="space-y-2">
                  {ROLES.map((role) => (
                    <label
                      key={role.value}
                      className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        form.role === role.value
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={role.value}
                        checked={form.role === role.value}
                        onChange={(e) =>
                          setForm({ ...form, role: e.target.value })
                        }
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-gray-900">
                          {role.label}
                        </span>
                        <span className="text-xs text-gray-400 ml-2">
                          — {role.desc}
                        </span>
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${role.color}`}
                      >
                        {role.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 font-medium"
                >
                  {submitting
                    ? "Menyimpan..."
                    : editId
                      ? "💾 Update"
                      : "✅ Buat User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tabel User */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Daftar User</h2>
          <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
            {users.length} user
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-gray-100 bg-gray-50">
                <th className="px-6 py-3">Nama</th>
                <th className="px-6 py-3">Username</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-sm font-bold flex-shrink-0">
                        {u.full_name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {u.full_name}
                        </div>
                        <div className="text-xs text-gray-400">
                          {u.email || "Tidak ada email"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                      {u.username}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${getRoleColor(u.role)}`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        u.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {u.is_active ? "● Aktif" : "● Nonaktif"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(u)}
                        className="px-3 py-1.5 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                      >
                        ✏️ Edit
                      </button>
                      {u.id !== currentUser?.id &&
                        u.role !== "superadmin" &&
                        u.is_active && (
                          <button
                            onClick={() => handleDeactivate(u.id, u.username)}
                            className="px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium"
                          >
                            🚫 Nonaktifkan
                          </button>
                        )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
