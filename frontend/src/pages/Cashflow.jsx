import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import api from "../services/api";
import LoadingSpinner from "../components/UI/LoadingSpinner";
import { formatRupiah } from "../utils/format";

const periods = [
  { value: "week", label: "Minggu Ini" },
  { value: "month", label: "Bulan Ini" },
  { value: "year", label: "Tahun Ini" },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
        <p className="text-xs font-medium text-gray-600 mb-1">{label}</p>
        <p className="text-sm font-bold text-blue-600">
          {formatRupiah(payload[0]?.value)}
        </p>
        <p className="text-xs text-gray-400">{payload[1]?.value} transaksi</p>
      </div>
    );
  }
  return null;
};

const Cashflow = () => {
  const [period, setPeriod] = useState("week");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCashflow = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/parking/cashflow?period=${period}`);
      const raw = res.data.data;

      // Format data untuk chart
      const formatted = raw.map((item) => ({
        label: item.day_name?.trim() || item.label,
        total: parseInt(item.total),
        transactions: parseInt(item.transactions),
      }));
      setData(formatted);
    } catch (err) {
      setError("Gagal memuat data cashflow");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCashflow();
  }, [period]);

  // Hitung total dan rata-rata
  const totalRevenue = data.reduce((sum, d) => sum + d.total, 0);
  const totalTrx = data.reduce((sum, d) => sum + d.transactions, 0);
  const avgRevenue = data.length ? Math.round(totalRevenue / data.length) : 0;
  const highestDay = data.reduce((max, d) => (d.total > max.total ? d : max), {
    total: 0,
    label: "-",
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Laporan Cashflow</h1>
          <p className="text-gray-400 text-sm mt-1">
            Pendapatan parkir per periode
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex gap-2">
          {periods.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                period === p.value
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-sm mb-4">
          ⚠️ {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Total Pendapatan",
            value: formatRupiah(totalRevenue),
            icon: "💰",
            color: "bg-blue-50 text-blue-600",
          },
          {
            label: "Total Transaksi",
            value: totalTrx,
            icon: "🎫",
            color: "bg-green-50 text-green-600",
          },
          {
            label: "Rata-rata/Hari",
            value: formatRupiah(avgRevenue),
            icon: "📊",
            color: "bg-purple-50 text-purple-600",
          },
          {
            label: "Hari Tertinggi",
            value: highestDay.label,
            icon: "🏆",
            color: "bg-amber-50 text-amber-600",
          },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-500">
                {card.label}
              </span>
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${card.color}`}
              >
                {card.icon}
              </div>
            </div>
            <div className="text-lg font-bold text-gray-900 truncate">
              {card.value}
            </div>
          </div>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner text="Memuat data chart..." />
      ) : (
        <>
          {/* Area Chart — Pendapatan */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
            <h2 className="text-base font-semibold text-gray-900 mb-6">
              Grafik Pendapatan —{" "}
              {periods.find((p) => p.value === period)?.label}
            </h2>
            {data.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <div className="text-4xl mb-3">📊</div>
                <p className="text-sm">Belum ada data pendapatan</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart
                  data={data}
                  margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                >
                  <defs>
                    <linearGradient
                      id="colorRevenue"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#3b82f6"
                        stopOpacity={0.15}
                      />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                  />
                  <YAxis
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="url(#colorRevenue)"
                    name="Pendapatan"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Bar Chart — Transaksi */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-6">
              Jumlah Transaksi —{" "}
              {periods.find((p) => p.value === period)?.label}
            </h2>
            {data.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <div className="text-4xl mb-3">📈</div>
                <p className="text-sm">Belum ada data transaksi</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={data}
                  margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                  />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="transactions"
                    name="Jumlah Transaksi"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Cashflow;
