export const ROLE_ACCESS = {
  superadmin: [
    "dashboard",
    "entry",
    "exit",
    "vehicles",
    "users",
    "lost-tickets",
    "cashflow",
  ],
  admin: [
    "dashboard",
    "entry",
    "exit",
    "vehicles",
    "users",
    "lost-tickets",
    "cashflow",
  ],
  operator: ["dashboard", "entry", "exit", "vehicles", "lost-tickets"],
  cashier: ["dashboard", "exit", "vehicles", "lost-tickets", "cashflow"],
  supervisor: ["dashboard", "vehicles", "lost-tickets", "cashflow"],
  teknisi: ["dashboard"],
};

export const canAccess = (role, page) => {
  const access = ROLE_ACCESS[role] || [];
  return access.includes(page);
};
