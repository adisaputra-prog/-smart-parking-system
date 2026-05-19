// pages/ActiveVehicles.jsx
import { useState, useEffect } from "react";
import { parkingAPI } from "../services/api";
import Badge from "../components/UI/Badge";
import LoadingSpinner from "../components/UI/LoadingSpinner";
import { formatDate, getVehicleIcon } from "../utils/format";

const ActiveVehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchVehicles = async () => {
    try {
      const res = await parkingAPI.getActiveVehicles();
      setVehicles(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    fetchVehicles();
    // Set interval untuk refresh data setiap 15 detik
    const interval = setInterval(() => {
      fetchVehicles();
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const filtered = vehicles.filter((v) =>
    v.plate_number.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) return <LoadingSpinner text="Memuat data kendaraan..." />;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kendaraan Aktif</h1>
          <p className="text-gray-400 text-sm mt-1">
            {vehicles.length} kendaraan di dalam area parkir
          </p>
        </div>
        <button
          onClick={fetchVehicles}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="🔍 Cari plat nomor..."
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-3">🅿️</div>
            <p className="text-sm">Tidak ada kendaraan ditemukan</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-gray-100 bg-gray-50">
                <th className="px-6 py-3">Plat Nomor</th>
                <th className="px-6 py-3">Jenis</th>
                <th className="px-6 py-3">Waktu Masuk</th>
                <th className="px-6 py-3">Durasi</th>
                <th className="px-6 py-3">Operator</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((v) => (
                <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono font-bold text-gray-900">
                      {v.plate_number}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {getVehicleIcon(v.vehicle_type)} {v.vehicle_type}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(v.entry_time)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {Math.floor(v.duration_mins_so_far)} menit
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {v.operator_name || "-"}
                  </td>
                  <td className="px-6 py-4">
                    <Badge status={v.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ActiveVehicles;
