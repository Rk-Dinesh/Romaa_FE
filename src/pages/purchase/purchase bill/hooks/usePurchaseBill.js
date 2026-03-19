import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../../services/api";
import { toast } from "react-toastify";

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
    staleTime: 1 * 60 * 1000,
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

/* ── Create purchase bill ───────────────────────────────────────────────── */
const createBillApi = async (payload) => {
  const { data } = await api.post("/purchase/bill/create", payload);
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
