// src/utils/fareCalculator.js
// Hitung tarif parkir otomatis berdasarkan durasi
// Logika: jam pertama = tarif pertama, jam berikutnya = tarif lanjutan

const dayjs = require("dayjs");

const calculateFare = (entryTime, exitTime, tariff) => {
  // Hitung durasi dalam menit
  const entry = dayjs(entryTime);
  const exit = dayjs(exitTime);
  const durationMins = exit.diff(entry, "minute");

  // Minimal 1 menit (hindari durasi 0)
  const totalMins = Math.max(durationMins, 1);

  // Konversi ke jam (dibulatkan ke atas)
  // Contoh: 61 menit = 2 jam (bukan 1 jam)
  const totalHours = Math.ceil(totalMins / 60);

  let fee = 0;

  if (totalHours <= 1) {
    // Jam pertama
    fee = tariff.first_hour_fee;
  } else {
    // Jam pertama + jam-jam berikutnya
    fee = tariff.first_hour_fee + (totalHours - 1) * tariff.next_hour_fee;
  }

  // Terapkan batas maksimum harian
  fee = Math.min(fee, tariff.daily_max_fee);

  return {
    duration_mins: totalMins,
    total_hours: totalHours,
    fee_amount: fee,
    entry_time: entry.format("YYYY-MM-DD HH:mm:ss"),
    exit_time: exit.format("YYYY-MM-DD HH:mm:ss"),
  };
};

// Format rupiah untuk tampilan
const formatRupiah = (amount) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

module.exports = { calculateFare, formatRupiah };
