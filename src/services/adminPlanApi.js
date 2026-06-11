import axios from "axios";
import { API_BASE_URL } from "../config/api";

// VITE_API_URL should include /api; do not add /api prefix to paths.
const API_BASE = import.meta.env.VITE_API_URL || API_BASE_URL;

/**
 * Returns Authorization header using token from localStorage.
 */
const authHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const adminPlanApi = {
  /**
   * GET /api/admin/plans
   * Fetch all plans (including inactive) for the admin dashboard.
   */
  getAllPlans: async () => {
    const { data } = await axios.get(`${API_BASE}/admin/plans`, {
      headers: authHeader(),
    });
    return data;
  },

  /**
   * POST /api/admin/plans
   * Create a new subscription plan.
   */
  createPlan: async (planData) => {
    const { data } = await axios.post(`${API_BASE}/admin/plans`, planData, {
      headers: authHeader(),
    });
    return data;
  },

  /**
   * PUT /api/admin/plans/:id
   * Update an existing plan.
   */
  updatePlan: async (id, planData) => {
    const { data } = await axios.put(
      `${API_BASE}/admin/plans/${id}`,
      planData,
      { headers: authHeader() }
    );
    return data;
  },

  /**
   * PATCH /api/admin/plans/:id/toggle
   * Toggle a plan's isActive status.
   */
  togglePlanStatus: async (id) => {
    const { data } = await axios.patch(
      `${API_BASE}/admin/plans/${id}/toggle`,
      {},
      { headers: authHeader() }
    );
    return data;
  },

  /**
   * DELETE /api/admin/plans/:id
   * Delete a plan permanently.
   */
  deletePlan: async (id) => {
    const { data } = await axios.delete(`${API_BASE}/admin/plans/${id}`, {
      headers: authHeader(),
    });
    return data;
  },
};

export default adminPlanApi;
