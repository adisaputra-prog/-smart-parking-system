// utils/format.js
// Helper untuk format tampilan data

export const formatRupiah = (amount) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount || 0);
};

export const formatDate = (dateString) => {
  if (!dateString) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString));
};

export const formatDuration = (mins) => {
  if (!mins) return "-";
  const hours = Math.floor(mins / 60);
  const minutes = mins % 60;
  if (hours === 0) return `${minutes} menit`;
  return `${hours} jam ${minutes} menit`;
};

export const getVehicleIcon = (type) => {
  const icons = { motor: "🏍️", mobil: "🚗", truk: "🚚" };
  return icons[type] || "🚗";
};
