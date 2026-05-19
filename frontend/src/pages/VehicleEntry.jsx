// pages/VehicleEntry.jsx
import { useState } from "react";
import { parkingAPI } from "../services/api";
import { formatDate } from "../utils/format";

const VehicleEntry = () => {
  const [form, setForm] = useState({ plate_number: "", vehicle_type: "mobil" });
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const res = await parkingAPI.vehicleEntry(form);
      setResult(res.data.data);
      setForm({ plate_number: "", vehicle_type: "mobil" });
    } catch (err) {
      setError(
        err.response?.data?.message || "Gagal memproses kendaraan masuk",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Kendaraan Masuk</h1>
        <p className="text-gray-400 text-sm mt-1">
          Input data kendaraan yang masuk area parkir
        </p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Plat Nomor
            </label>
            <input
              type="text"
              value={form.plate_number}
              onChange={(e) =>
                setForm({ ...form, plate_number: e.target.value.toUpperCase() })
              }
              className="w-full border border-gray-200 rounded-lg px-4 py-3 font-mono text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
              placeholder="B 1234 ABC"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jenis Kendaraan
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: "motor", label: "Motor", icon: "🏍️" },
                { value: "mobil", label: "Mobil", icon: "🚗" },
                { value: "truk", label: "Truk", icon: "🚚" },
              ].map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setForm({ ...form, vehicle_type: type.value })}
                  className={`p-4 rounded-lg border-2 text-center transition-all ${
                    form.vehicle_type === type.value
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="text-2xl mb-1">{type.icon}</div>
                  <div className="text-sm font-medium">{type.label}</div>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-sm">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? "Memproses..." : "✅ Proses Masuk"}
          </button>
        </form>
      </div>

      {/* Hasil / Tiket */}
      {result && (
        <div className="bg-white rounded-xl border-2 border-blue-200 shadow-sm p-6">
          <div className="text-center mb-6">
            <div className="text-green-500 text-4xl mb-2">✅</div>
            <h2 className="text-xl font-bold text-gray-900">
              Kendaraan Berhasil Masuk
            </h2>
          </div>

          <div className="space-y-3 mb-6">
            {[
              { label: "Kode Tiket", value: result.ticket_code, mono: true },
              { label: "Plat Nomor", value: result.plate_number, mono: true },
              { label: "Jenis", value: result.vehicle_type },
              { label: "Waktu Masuk", value: formatDate(result.entry_time) },
            ].map((item) => (
              <div
                key={item.label}
                className="flex justify-between py-2 border-b border-gray-50"
              >
                <span className="text-sm text-gray-500">{item.label}</span>
                <span
                  className={`text-sm font-semibold text-gray-900 ${item.mono ? "font-mono" : ""}`}
                >
                  {item.value}
                </span>
              </div>
            ))}
          </div>

          {/* QR Code */}
          {result.qr_code && (
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-3">QR Code Tiket</p>
              <img
                src={result.qr_code}
                alt="QR Code"
                className="w-48 h-48 mx-auto border border-gray-200 rounded-lg p-2"
              />
              <p className="text-xs text-gray-400 mt-2">
                Scan QR ini saat kendaraan keluar
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VehicleEntry;
