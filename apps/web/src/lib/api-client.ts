import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1",
  withCredentials: true, // Send cookies for auth (HttpOnly cookie set by backend)
});

// Note: We no longer manually inject Bearer tokens.
// The backend sets an HttpOnly cookie on login/register.
// Axios withCredentials=true will send cookies automatically.
// The /me endpoint is called after login to sync user state.

// ─── Auth ────────────────────────────────────────────────────────────────────

export const authApi = {
  login: (data: { username: string; password: string }) =>
    api.post("/auth/login", data),
  register: (data: { username: string; email: string; password: string; phone?: string }) =>
    api.post("/auth/register", data),
  logout: () => api.post("/auth/logout"),
  me: () => api.get("/auth/me"),
};

// ─── Ledgers ─────────────────────────────────────────────────────────────────

export const ledgerApi = {
  list: (params?: { status?: string; category_id?: string; search?: string }) =>
    api.get("/ledgers/", { params }),
  get: (id: string) => api.get(`/ledgers/${id}`),
  create: (data: {
    product_name: string;
    batch_no: string;
    cas_no: string;
    weight_capacity: string;
    supplier: string;
    quantity: number;
    category_id: string;
    cert_expiry_date: string;
    open_date?: string;
  }) => api.post("/ledgers/", data),
  update: (id: string, data: Record<string, unknown>) =>
    api.patch(`/ledgers/${id}`, data),
  enterOpenDate: (id: string, open_date: string) =>
    api.patch(`/ledgers/${id}/open?open_date=${open_date}`),
  archive: (id: string) => api.post(`/ledgers/${id}/archive`),
};

// ─── Categories ───────────────────────────────────────────────────────────────

export const categoryApi = {
  list: () => api.get("/categories/"),
  get: (id: string) => api.get(`/categories/${id}`),
  create: (data: {
    level1: string;
    level2: string;
    warning_threshold_days?: number;
    unopened_shelf_months: number;
    opened_shelf_months: number;
    remarks?: string;
  }) => api.post("/categories/", data),
};

// ─── Notifications ───────────────────────────────────────────────────────────

export const notificationApi = {
  list: () => api.get("/notifications/"),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
};

// ─── Research ────────────────────────────────────────────────────────────────

export const researchApi = {
  getQuota: () => api.get("/research/quota"),
  listNotebooks: () => api.get("/research/notebooks"),
  createNotebook: (notebook_id: string, name: string) =>
    api.post("/research/notebooks", null, { params: { notebook_id, name } }),
};

// ─── Users (admin) ────────────────────────────────────────────────────────────

export const userApi = {
  list: () => api.get("/users/"),
  get: (id: string) => api.get(`/users/${id}`),
};

export default api;