import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { api } from "../../../../services/api";
import { toast } from "react-toastify";

/* ── All-tenders summary (finance overview table) ──────────────────────── */
const fetchAllTendersSummary = async ({ queryKey }) => {
  const [, params] = queryKey;
  const { data } = await api.get("/purchasebill/summary-all", {
    params: {
      page: params.page,
      limit: params.limit,
      search: params.search,
      fromdate: params.fromdate,
      todate: params.todate,
    },
  });
  return data;
};

export const useAllTendersSummary = (queryParams = {}) =>
  useQuery({
    queryKey: ["purchase-bill-summary-all", queryParams],
    queryFn:  fetchAllTendersSummary,
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  });

/* ── Bills by tender ────────────────────────────────────────────────────── */
const fetchBillsByTender = async ({ queryKey }) => {
  const [, tenderId, params] = queryKey;
  const { data } = await api.get(`/purchasebill/by-tender/${tenderId}`, {
    params: {
      page: params.page,
      limit: params.limit,
      search: params.search,
      fromdate: params.fromdate,
      todate: params.todate,
    },
  });
  return data.data || [];
};

export const useBillsByTender = (tenderId, queryParams = {}) =>
  useQuery({
    queryKey: ["bills-by-tender", tenderId, queryParams],
    queryFn:  fetchBillsByTender,
    enabled:  !!tenderId,
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });

/* ── Fetch all tender IDs (for dropdown) ────────────────────────────────── */
const fetchTenderIds = async () => {
  const { data } = await api.get("/tender/gettendersid");
  return data.data || [];
};

export const useTenderIds = () =>
  useQuery({
    queryKey: ["tender-ids"],
    queryFn:  fetchTenderIds,
    staleTime: 5 * 60 * 1000,
  });

/* ── Fetch permitted vendors for a tender ───────────────────────────────── */
const fetchPermittedVendors = async ({ queryKey }) => {
  const [, tenderId] = queryKey;
  const { data } = await api.get(`/permittedvendor/getvendor/${tenderId}`);
  // handle both { permitted_vendors: [...] } and { data: { permitted_vendors: [...] } }
  return data?.permitted_vendors ?? data?.data?.permitted_vendors ?? [];
};

export const usePermittedVendors = (tenderId) =>
  useQuery({
    queryKey: ["permitted-vendors", tenderId],
    queryFn:  fetchPermittedVendors,
    enabled:  !!tenderId,
  });

/* ── Fetch GRN entries for billing ─────────────────────────────────────── */
const fetchGRNForBilling = async ({ queryKey }) => {
  const [, tenderId, vendorId] = queryKey;
  const { data } = await api.get(`/material/grn/billing/${tenderId}/${vendorId}`);
  return data?.data || [];
};

export const useGRNForBilling = (tenderId, vendorId) =>
  useQuery({
    queryKey: ["grn-billing", tenderId, vendorId],
    queryFn:  fetchGRNForBilling,
    enabled:  !!tenderId && !!vendorId,
   // staleTime: 1 * 60 * 1000, // 1 minute
  });

/* ── Fetch next bill ID ─────────────────────────────────────────────────── */
const fetchNextBillId = async () => {
  const { data } = await api.get("/purchasebill/next-id");
  return data?.doc_id || "";
};

export const useNextBillId = () =>
  useQuery({
    queryKey: ["next-bill-id"],
    queryFn:  fetchNextBillId,
    staleTime: 0,
    refetchOnMount: true,
  });

/* ── Approve purchase bill ──────────────────────────────────────────────── */
const approveBillApi = async (id) => {
  const { data } = await api.patch(`/purchasebill/approve/${id}`);
  return data;
};

export const useApprovePurchaseBill = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: approveBillApi,
    onSuccess: () => {
      toast.success("Purchase bill approved");
      queryClient.invalidateQueries({ queryKey: ["purchase-bill-summary-all"] });
      queryClient.invalidateQueries({ queryKey: ["bills-by-tender"] });
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to approve purchase bill"),
  });
};

/* ── Delete purchase bill ───────────────────────────────────────────────── */
const deleteBillApi = async (id) => {
  const { data } = await api.delete(`/purchasebill/delete/${id}`);
  return data;
};

export const useDeletePurchaseBill = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteBillApi,
    onSuccess: () => {
      toast.success("Purchase bill deleted");
      queryClient.invalidateQueries({ queryKey: ["purchase-bill-summary-all"] });
      queryClient.invalidateQueries({ queryKey: ["bills-by-tender"] });
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to delete purchase bill"),
  });
};

/* ── Create purchase bill ───────────────────────────────────────────────── */
const createBillApi = async (payload) => {
  const { data } = await api.post("/purchasebill/create", payload);
  return data;
};

export const useCreateBill = ({ onSuccess, onClose }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBillApi,
    onSuccess: () => {
      toast.success("Purchase bill created successfully");
      queryClient.invalidateQueries(["purchase-bills"]);
      if (onSuccess) onSuccess();
      if (onClose)   onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to create bill");
    },
  });
};
