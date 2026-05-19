// pages/VehicleExit.jsx
import { useState } from "react";
import { parkingAPI } from "../services/api";
import { formatDate, formatDuration } from "../utils/format";

const VehicleExit = () => {
  const [qrHash, setQrHash] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const res = await parkingAPI.vehicleExit({ qr_hash: qrHash.trim() });
      setResult(res.data.data);
      setQrHash("");
    } catch (err) {
      setError(
        err.response?.data?.message || "Gagal memproses kendaraan keluar",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Kendaraan Keluar</h1>
        <p className="text-gray-400 text-sm mt-1">
          Scan QR code atau input hash untuk proses keluar
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              QR Hash Code
            </label>
            <textarea
              value={qrHash}
              onChange={(e) => setQrHash(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Paste QR hash code di sini..."
              rows={3}
              required
            />
            <p className="text-xs text-gray-400 mt-1">
              Hash didapat dari QR code yang di-scan saat kendaraan masuk
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-sm">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? "Memproses..." : "🚗 Proses Keluar"}
          </button>
        </form>
      </div>

      {/* Hasil */}
      {result && (
        <div className="bg-white rounded-xl border-2 border-green-200 shadow-sm p-6">
          <div className="text-center mb-6">
            <div className="text-green-500 text-4xl mb-2">✅</div>
            <h2 className="text-xl font-bold text-gray-900">
              Kendaraan Berhasil Keluar
            </h2>
          </div>

          <div className="space-y-3 mb-6">
            {[
              { label: "Kode Tiket", value: result.ticket_code, mono: true },
              { label: "Plat Nomor", value: result.plate_number, mono: true },
              { label: "Masuk", value: formatDate(result.entry_time) },
              { label: "Keluar", value: formatDate(result.exit_time) },
              { label: "Durasi", value: formatDuration(result.duration_mins) },
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

          {/* Total Bayar */}
          <div className="bg-green-50 rounded-xl p-5 text-center">
            <p className="text-sm text-green-600 mb-1">Total Pembayaran</p>
            <p className="text-3xl font-bold text-green-700">
              {result.fee_formatted}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleExit;
