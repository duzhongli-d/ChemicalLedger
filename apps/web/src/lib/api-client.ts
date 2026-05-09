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
  login: (data: { username?: string; email?: string; password: string }) =>
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
  update: (id: string, data: {
    warning_threshold_days?: number;
    unopened_shelf_months?: number;
    opened_shelf_months?: number;
    remarks?: string;
  }) => api.patch(`/admin/categories/${id}`, data),
};

export interface CategoryResponse {
  id: string;
  level1: string;
  level2: string;
  warning_threshold_days: number;
  unopened_shelf_months: number;
  opened_shelf_months: number;
  remarks?: string;
  created_at: string;
}

// ─── Notifications ───────────────────────────────────────────────────────────

export const notificationApi = {
  list: () => api.get("/notifications/"),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
};

// ─── Research ────────────────────────────────────────────────────────────────

export interface ResearchSource {
  id: string;
  notebook_id: string;
  source_type: "PDF" | "URL" | "TEXT" | "VIDEO" | "AUDIO";
  file_url: string | null;
  file_name: string | null;
  file_size: number | null;
  status: "PENDING" | "PROCESSING" | "READY" | "ERROR";
  notebooklm_id: string | null;
  extra_data: Record<string, unknown> | null;
  created_at: string;
}

export const researchApi = {
  getQuota: () => api.get("/research/quota"),
  listNotebooks: () => api.get("/research/notebooks"),
  createNotebook: (notebook_id: string, name: string) =>
    api.post("/research/notebooks", null, { params: { notebook_id, name } }),
  listSources: (notebook_id: string) =>
    api.get<ResearchSource[]>(`/research/sources/${notebook_id}`),
  uploadSource: (notebook_id: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post<ResearchSource>(`/research/sources/upload?notebook_id=${notebook_id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  addUrlSource: (notebook_id: string, url: string, title?: string) =>
    api.post<ResearchSource>(`/research/sources/add-url?notebook_id=${notebook_id}`, { url, title }),
  deleteSource: (source_id: string) =>
    api.delete(`/research/sources/${source_id}`),
  chat: (notebook_id: string, question: string) => {
    return api.post("/research/chat", null, {
      params: { notebook_id, question },
      responseType: "stream",
    });
  },
  studio: {
    generateLearningGuide: (notebook_id: string, topic: string) =>
      api.post<{ title: string; sections: { heading: string; content: string }[] }>(
        "/research/studio/learning-guide",
        null,
        { params: { notebook_id, topic } }
      ),
    generateMindMap: (notebook_id: string, topic: string) =>
      api.post<{ root: { id: string; text: string; children?: { id: string; text: string; children?: { id: string; text: string }[] }[] } }>(
        "/research/studio/mindmap",
        null,
        { params: { notebook_id, topic } }
      ),
    generatePPT: (notebook_id: string, topic: string) =>
      api.post<{ title: string; slides: { title: string; bulletPoints: string[] }[] }>(
        "/research/studio/ppt",
        null,
        { params: { notebook_id, topic } }
      ),
  },
};

// ─── Users (admin) ────────────────────────────────────────────────────────────

export const userApi = {
  list: () => api.get("/users/"),
  get: (id: string) => api.get(`/users/${id}`),
};

// ─── Admin Ledgers ───────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

export interface Ledger {
  id: string;
  internal_batch_no: string;
  product_name: string;
  batch_no: string;
  cas_no: string;
  weight_capacity: string;
  supplier: string;
  quantity: number;
  category: { id?: string; level1: string; level2: string };
  cert_expiry_date: string;
  effective_expiry_date: string;
  status: "active" | "archived";
  created_at: string;
  created_by_id: string;
  creator?: { username: string };
  is_opened: boolean;
  open_date: string | null;
  remarks?: string;
}

export const adminLedgerApi = {
  list: (params?: { page?: number; page_size?: number; status?: string; search?: string; category?: string }) =>
    api.get<PaginatedResponse<Ledger>>("/admin/ledgers/", { params }),
  update: (id: string, data: Record<string, unknown>) =>
    api.patch(`/admin/ledgers/${id}`, data),
  batchArchive: (ledgerIds: string[]) =>
    api.post("/admin/ledgers/batch-archive", { ledger_ids: ledgerIds }),
};

// ─── Admin Audit Logs ────────────────────────────────────────────────────────

export const auditLogApi = {
  list: (params?: {
    page?: number;
    page_size?: number;
    action?: string;
    user_id?: string;
    start_date?: string;
    end_date?: string;
    target_type?: string;
    target_id?: string;
  }) => api.get("/admin/audit-logs/", { params }),
};

// ─── Contact ─────────────────────────────────────────────────────────────────

export const contactApi = {
  submit: (data: {
    name: string;
    email: string;
    subject: string;
    category: string;
    message: string;
  }) => api.post("/contact/", data),
};

// ─── Admin Contact ─────────────────────────────────────────────────────────

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  category: string;
  message: string;
  is_read: boolean;
  created_at: string;
  user_id?: string;
  replies?: ContactReply[];
}

export interface ContactReply {
  id: string;
  admin_id: string;
  content: string;
  created_at: string;
  admin?: { id: string; username: string };
}

export const adminContactApi = {
  list: (params?: {
    page?: number;
    page_size?: number;
    is_read?: string;
    category?: string;
    search?: string;
  }) => api.get<PaginatedResponse<ContactSubmission>>("/admin/contact/", { params }),
  get: (id: string) => api.get<ContactSubmission>(`/admin/contact/${id}`),
  markRead: (id: string) => api.patch(`/admin/contact/${id}/read`),
  reply: (id: string, content: string) => api.post(`/admin/contact/${id}/reply`, { content }),
};

// ─── Admin Annual Summaries ─────────────────────────────────────────────────

export interface AnnualSummary {
  id: string;
  year: number;
  section: string;
  category: string | null;
  project_count: number;
  project_names: string | null;
  batch_count: number;
  yoy_growth: string | null;
  created_at: string;
  updated_at: string;
}

export const adminAnnualSummaryApi = {
  list: (params?: { year?: number; section?: string }) =>
    api.get<AnnualSummary[]>("/admin/annual-summaries/", { params }),
  getByYear: (year: number) =>
    api.get<AnnualSummary[]>(`/admin/annual-summaries/${year}`),
  create: (data: {
    year: number;
    section: string;
    category?: string | null;
    project_count?: number;
    project_names?: string | null;
    batch_count?: number;
    yoy_growth?: string | null;
  }) => api.post<AnnualSummary>("/admin/annual-summaries/", data),
  update: (id: string, data: Record<string, unknown>) =>
    api.patch<AnnualSummary>(`/admin/annual-summaries/${id}`, data),
  delete: (id: string) =>
    api.delete(`/admin/annual-summaries/${id}`),
};

// ─── Settings ─────────────────────────────────────────────────────────────────

export interface PublicContactSettings {
  address?: string;
  phone?: string;
  email?: string;
  wechat?: string;
  business_hours?: string;
}

export const settingsApi = {
  getContactSettings: () =>
    api.get<PublicContactSettings>("/settings/contact").then((r) => r.data),
};

export default api;