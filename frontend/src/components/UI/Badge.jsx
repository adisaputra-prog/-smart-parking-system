const Badge = ({ status }) => {
  const styles = {
    active: "bg-green-100 text-green-700",
    completed: "bg-blue-100 text-blue-700",
    lost: "bg-red-100 text-red-700",
    voided: "bg-gray-100 text-gray-600",
  };

  const labels = {
    active: "Di Dalam",
    completed: "Selesai",
    lost: "Hilang",
    voided: "Batal",
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.voided}`}
    >
      {labels[status] || status}
    </span>
  );
};

export default Badge;
