import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../../services/api";
import { toast } from "react-toastify";

export { useBankAccounts } from "../../bank_transactions/hooks/useVouchers";

const QK = "bank-transfers";

/* ── Next Transfer Number ───────────────────────────────────────────────── */
const fetchNextBTNo = async () => {
  const { data } = await api.get("/banktransfer/next-no");
  return data?.data?.transfer_no || "";
};

export const useNextBTNo = () =>
  useQuery({
    queryKey: ["next-bt-no"],
    queryFn:  fetchNextBTNo,
    staleTime: 0,
    refetchOnMount: true,
  });

/* ── List Bank Transfers ─────────────────────────────────────────────────── */
const fetchBTList = async ({ queryKey }) => {
  const [, params] = queryKey;
  const { data } = await api.get("/banktransfer/list", { params });
  return data?.data || [];
};

export const useBTList = (params = {}) =>
  useQuery({
    queryKey: [QK, params],
    queryFn:  fetchBTList,
    staleTime: 30 * 1000,
  });

/* ── Create Bank Transfer ───────────────────────────────────────────────── */
const createBT = async (payload) => {
  const { data } = await api.post("/banktransfer/create", payload);
  return data;
};

export const useCreateBT = ({ onSuccess, onClose } = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBT,
    onSuccess: () => {
      toast.success("Bank transfer created");
      queryClient.invalidateQueries({ queryKey: [QK] });
      queryClient.invalidateQueries({ queryKey: ["next-bt-no"] });
      if (onSuccess) onSuccess();
      if (onClose)   onClose();
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to create bank transfer"),
  });
};

/* ── Approve Bank Transfer ──────────────────────────────────────────────── */
export const useApproveBT = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.patch(`/banktransfer/approve/${id}`).then((r) => r.data),
    onSuccess: () => {
      toast.success("Transfer approved — balances updated");
      queryClient.invalidateQueries({ queryKey: [QK] });
      queryClient.invalidateQueries({ queryKey: ["finance-bank-accounts"] });
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to approve bank transfer"),
  });
};

/* ── Delete Bank Transfer ───────────────────────────────────────────────── */
export const useDeleteBT = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/banktransfer/delete/${id}`).then((r) => r.data),
    onSuccess: () => {
      toast.success("Bank transfer deleted");
      queryClient.invalidateQueries({ queryKey: [QK] });
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to delete bank transfer"),
  });
};
