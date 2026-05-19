// pages/Dashboard.jsx
import { useState, useEffect } from "react";
import { parkingAPI } from "../services/api";
import StatCard from "../components/UI/StatCard";
import Badge from "../components/UI/Badge";
import LoadingSpinner from "../components/UI/LoadingSpinner";
import { formatRupiah, formatDate, getVehicleIcon } from "../utils/format";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [statsRes, vehiclesRes] = await Promise.all([
        parkingAPI.getTodayStats(),
        parkingAPI.getActiveVehicles(),
      ]);
      setStats(statsRes.data.data);
      setVehicles(vehiclesRes.data.data);
    } catch (err) {
      console.error("Gagal fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchData();
    };
    loadData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <LoadingSpinner text="Memuat dashboard..." />;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">
            {new Date().toLocaleDateString("id-ID", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Kendaraan di Dalam"
          value={stats?.active_vehicles || 0}
          icon="🚗"
          color="blue"
          subtitle="Saat ini"
        />
        <StatCard
          title="Masuk Hari Ini"
          value={stats?.total_entry_today || 0}
          icon="⬇️"
          color="green"
          subtitle="Total kendaraan masuk"
        />
        <StatCard
          title="Keluar Hari Ini"
          value={stats?.total_exit_today || 0}
          icon="⬆️"
          color="amber"
          subtitle="Total kendaraan keluar"
        />
        <StatCard
          title="Pendapatan Hari Ini"
          value={formatRupiah(stats?.revenue_today)}
          icon="💰"
          color="green"
          subtitle="Total pendapatan"
        />
      </div>

      {/* Tabel Kendaraan Aktif */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Kendaraan di Dalam</h2>
          <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
            {vehicles.length} kendaraan
          </span>
        </div>

        {vehicles.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-3">🅿️</div>
            <p className="text-sm">Tidak ada kendaraan di dalam</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-gray-100">
                  <th className="px-6 py-3">Plat Nomor</th>
                  <th className="px-6 py-3">Jenis</th>
                  <th className="px-6 py-3">Waktu Masuk</th>
                  <th className="px-6 py-3">Durasi</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {vehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono font-semibold text-gray-900">
                        {v.plate_number}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600">
                        {getVehicleIcon(v.vehicle_type)} {v.vehicle_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(v.entry_time)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {Math.floor(v.duration_mins_so_far)} menit
                    </td>
                    <td className="px-6 py-4">
                      <Badge status={v.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
