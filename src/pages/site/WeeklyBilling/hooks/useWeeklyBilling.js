import { useQuery, useMutation, keepPreviousData, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../../services/api";
import { toast } from "react-toastify";

// ── List all generated bills for a tender ──────────────────────────────────────
const fetchBillingList = async (tenderId) => {
  const { data } = await api.get(`/weeklybilling/api/list/${tenderId}`);
  return data?.data || [];
};

export const useWeeklyBillingList = (tenderId) =>
  useQuery({
    queryKey: ["weekly-billing-list", tenderId],
    queryFn: () => fetchBillingList(tenderId),
    enabled: !!tenderId,
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  });

// ── All vendors linked to this site/tender ─────────────────────────────────────
const fetchSiteVendors = async (tenderId) => {
  const { data } = await api.get(`/permittedvendor/getvendor/${tenderId}`);
  return data?.data?.permitted_vendors || [];
};

export const useSiteVendors = (tenderId) =>
  useQuery({
    queryKey: ["billing-site-vendors", tenderId],
    queryFn: () => fetchSiteVendors(tenderId),
    enabled: !!tenderId,
    staleTime: 5 * 60 * 1000,
  });

// ── Vendor work-done summary for a date range ──────────────────────────────────
// Returns vendors with their aggregated work done items between fromDate..toDate
const fetchVendorSummary = async (tenderId, fromDate, toDate) => {
  const { data } = await api.get(
    `/weeklybilling/api/vendor-summary/${tenderId}`,
    { params: { fromDate, toDate } }
  );
  return data?.data || [];
};

export const useVendorWorkSummary = (tenderId, fromDate, toDate) =>
  useQuery({
    queryKey: ["billing-vendor-summary", tenderId, fromDate, toDate],
    queryFn: () => fetchVendorSummary(tenderId, fromDate, toDate),
    enabled: !!tenderId && !!fromDate && !!toDate,
    staleTime: 30 * 1000,
  });

// ── Generate a bill ────────────────────────────────────────────────────────────
export const useGenerateBill = ({ onSuccess, onClose }) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => api.post("/weeklybilling/api/generate", payload),
    onSuccess: (_, vars) => {
      toast.success("Bill generated successfully!");
      qc.invalidateQueries({ queryKey: ["weekly-billing-list", vars.tender_id] });
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || "Failed to generate bill");
    },
  });
};
