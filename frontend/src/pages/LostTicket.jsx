import { useState, useEffect } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { formatDate } from "../utils/format";
import LoadingSpinner from "../components/UI/LoadingSpinner";

const canRequest = ["operator", "cashier", "admin", "superadmin"];
const canReview = ["supervisor", "admin", "superadmin"];

const statusStyle = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-600",
};

const emptyForm = {
  plate_number: "",
  vehicle_type: "mobil",
  reason: "",
  ticket_code: "",
};

const LostTicket = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");

  // Review modal
  const [reviewModal, setReviewModal] = useState(null);
  const [reviewNotes, setReviewNotes] = useState("");

  const fetchRequests = async () => {
    try {
      const params = filterStatus ? `?status=${filterStatus}` : "";
      const res = await api.get(`/lost-tickets${params}`);
      setRequests(res.data.data);
    } catch (err) {
      setError("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [filterStatus]);

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await api.post("/lost-tickets", form);
      setSuccess("Request karcis hilang berhasil dikirim ke supervisor");
      setShowForm(false);
      setForm(emptyForm);
      fetchRequests();
    } catch (err) {
      setError(err.response?.data?.message || "Gagal membuat request");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReview = async (status) => {
    setError("");
    setSubmitting(true);
    try {
      await api.patch(`/lost-tickets/${reviewModal.id}/review`, {
        status,
        review_notes: reviewNotes,
      });
      setSuccess(
        `Request berhasil ${status === "approved" ? "disetujui" : "ditolak"}`,
      );
      setReviewModal(null);
      setReviewNotes("");
      fetchRequests();
    } catch (err) {
      setError(err.response?.data?.message || "Gagal memproses review");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner text="Memuat data karcis hilang..." />;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Karcis Hilang</h1>
          <p className="text-gray-400 text-sm mt-1">
            {canReview.includes(user.role)
              ? "Review dan approval request karcis hilang"
              : "Ajukan request karcis hilang ke supervisor"}
          </p>
        </div>
        {canRequest.includes(user.role) && (
          <button
            onClick={() => {
              setShowForm(true);
              setError("");
            }}
            className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm hover:bg-amber-600 font-medium"
          >
            ⚠️ Laporkan Karcis Hilang
          </button>
        )}
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

      {/* Filter */}
      <div className="flex gap-2 mb-4">
        {["", "pending", "approved", "rejected"].map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterStatus === s
                ? "bg-blue-600 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {s === "" ? "Semua" : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Form Request Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">
                ⚠️ Laporkan Karcis Hilang
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-sm mb-4">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmitRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kode Tiket{" "}
                  <span className="text-gray-400 font-normal">(jika ada)</span>
                </label>
                <input
                  type="text"
                  value={form.ticket_code}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      ticket_code: e.target.value.toUpperCase(),
                    })
                  }
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="PKR-20240101-XXXX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plat Nomor
                </label>
                <input
                  type="text"
                  value={form.plate_number}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      plate_number: e.target.value.toUpperCase(),
                    })
                  }
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="B 1234 ABC"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jenis Kendaraan
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["motor", "mobil", "truk"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm({ ...form, vehicle_type: t })}
                      className={`p-2 rounded-lg border-2 text-sm font-medium transition-all ${
                        form.vehicle_type === t
                          ? "border-amber-500 bg-amber-50 text-amber-700"
                          : "border-gray-200 text-gray-600"
                      }`}
                    >
                      {t === "motor" ? "🏍️" : t === "mobil" ? "🚗" : "🚚"} {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alasan / Keterangan
                </label>
                <textarea
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                  placeholder="Jelaskan situasi karcis hilang..."
                  rows={3}
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 bg-amber-500 text-white rounded-lg text-sm hover:bg-amber-600 disabled:opacity-50 font-medium"
                >
                  {submitting ? "Mengirim..." : "📤 Kirim Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">
                📋 Review Request
              </h2>
              <button
                onClick={() => setReviewModal(null)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ✕
              </button>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Plat Nomor</span>
                <span className="font-mono font-bold">
                  {reviewModal.plate_number}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Jenis</span>
                <span>{reviewModal.vehicle_type}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Diminta oleh</span>
                <span className="font-medium">
                  {reviewModal.requested_by_name}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tanggal</span>
                <span>{formatDate(reviewModal.created_at)}</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-500">Alasan:</span>
                <p className="mt-1 text-gray-700 bg-white rounded p-2 border border-gray-200">
                  {reviewModal.reason}
                </p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Catatan Review{" "}
                <span className="text-gray-400 font-normal">(opsional)</span>
              </label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Catatan untuk operator..."
                rows={2}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleReview("rejected")}
                disabled={submitting}
                className="flex-1 px-4 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm hover:bg-red-100 font-medium disabled:opacity-50"
              >
                ❌ Tolak
              </button>
              <button
                onClick={() => handleReview("approved")}
                disabled={submitting}
                className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 font-medium disabled:opacity-50"
              >
                ✅ Setujui
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabel Request */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Daftar Request</h2>
          <span className="bg-amber-100 text-amber-700 text-xs font-medium px-2.5 py-1 rounded-full">
            {requests.filter((r) => r.status === "pending").length} pending
          </span>
        </div>

        {requests.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-3">📋</div>
            <p className="text-sm">Tidak ada request karcis hilang</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-b bg-gray-50">
                  <th className="px-6 py-3">Plat Nomor</th>
                  <th className="px-6 py-3">Jenis</th>
                  <th className="px-6 py-3">Diminta Oleh</th>
                  <th className="px-6 py-3">Tanggal</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {requests.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-gray-900">
                      {r.plate_number}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {r.vehicle_type}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {r.requested_by_name}
                      </div>
                      <div className="text-xs text-gray-400">
                        {r.requested_by_username}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(r.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle[r.status]}`}
                      >
                        {r.status === "pending"
                          ? "⏳ Pending"
                          : r.status === "approved"
                            ? "✅ Disetujui"
                            : "❌ Ditolak"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {r.status === "pending" &&
                        canReview.includes(user.role) && (
                          <button
                            onClick={() => {
                              setReviewModal(r);
                              setReviewNotes("");
                            }}
                            className="px-3 py-1.5 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-medium"
                          >
                            📋 Review
                          </button>
                        )}
                      {r.status !== "pending" && r.reviewed_by_name && (
                        <span className="text-xs text-gray-400">
                          oleh {r.reviewed_by_name}
                        </span>
                      )}
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

export default LostTicket;
