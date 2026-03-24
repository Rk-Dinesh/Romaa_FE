import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../../services/api";
import { toast } from "react-toastify";

/* ── Shared party hooks (re-exported from DN/CN) ────────────────────────── */
export { useTenderIds, useVendors, useContractors } from "../../debit_creditnote/hooks/useDebitCreditNote";

/* ── Next PV Number ─────────────────────────────────────────────────────── */
const fetchNextPVNo = async () => {
  const { data } = await api.get("/paymentvoucher/next-no");
  return data?.pv_no || "";
};

export const useNextPVNo = () =>
  useQuery({
    queryKey: ["next-pv-no"],
    queryFn:  fetchNextPVNo,
    staleTime: 0,
    refetchOnMount: true,
  });

/* ── Next RV Number ─────────────────────────────────────────────────────── */
const fetchNextRVNo = async () => {
  const { data } = await api.get("/receiptvoucher/next-no");
  return data?.rv_no || "";
};

export const useNextRVNo = () =>
  useQuery({
    queryKey: ["next-rv-no"],
    queryFn:  fetchNextRVNo,
    staleTime: 0,
    refetchOnMount: true,
  });

/* ── Create Payment Voucher ─────────────────────────────────────────────── */
const createPVApi = async (payload) => {
  const { data } = await api.post("/paymentvoucher/create", payload);
  return data;
};

export const useCreatePV = ({ onSuccess, onClose } = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPVApi,
    onSuccess: () => {
      toast.success("Payment voucher created successfully");
      queryClient.invalidateQueries({ queryKey: ["payment-vouchers"] });
      queryClient.invalidateQueries({ queryKey: ["next-pv-no"] });
      if (onSuccess) onSuccess();
      if (onClose)   onClose();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to create payment voucher");
    },
  });
};

/* ── Create Receipt Voucher ─────────────────────────────────────────────── */
const createRVApi = async (payload) => {
  const { data } = await api.post("/receiptvoucher/create", payload);
  return data;
};

export const useCreateRV = ({ onSuccess, onClose } = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createRVApi,
    onSuccess: () => {
      toast.success("Receipt voucher created successfully");
      queryClient.invalidateQueries({ queryKey: ["receipt-vouchers"] });
      queryClient.invalidateQueries({ queryKey: ["next-rv-no"] });
      if (onSuccess) onSuccess();
      if (onClose)   onClose();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to create receipt voucher");
    },
  });
};

/* ── List Payment Vouchers ──────────────────────────────────────────────── */
const fetchPVList = async ({ queryKey }) => {
  const [, params] = queryKey;
  const { data } = await api.get("/paymentvoucher/list", { params });
  return data?.data || [];
};

export const usePVList = (params = {}) =>
  useQuery({
    queryKey: ["payment-vouchers", params],
    queryFn:  fetchPVList,
    staleTime: 30 * 1000,
  });

/* ── List Receipt Vouchers ──────────────────────────────────────────────── */
const fetchRVList = async ({ queryKey }) => {
  const [, params] = queryKey;
  const { data } = await api.get("/receiptvoucher/list", { params });
  return data?.data || [];
};

export const useRVList = (params = {}) =>
  useQuery({
    queryKey: ["receipt-vouchers", params],
    queryFn:  fetchRVList,
    staleTime: 30 * 1000,
  });
