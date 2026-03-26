import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../../services/api";
import { toast } from "react-toastify";

const QK = "company-cash-accounts";

/* ── List ────────────────────────────────────────────────────────────────── */
const fetchCashAccounts = async () => {
  const { data } = await api.get("/companycashaccount/list");
  return data?.data || [];
};

export const useCashAccounts = () =>
  useQuery({
    queryKey: [QK],
    queryFn: fetchCashAccounts,
    staleTime: 30 * 1000,
  });

/* ── Create ─────────────────────────────────────────────────────────────── */
const createCashAccount = async (payload) => {
  const { data } = await api.post("/companycashaccount/create", payload);
  return data;
};

export const useCreateCashAccount = ({ onClose } = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCashAccount,
    onSuccess: () => {
      toast.success("Cash account created");
      queryClient.invalidateQueries({ queryKey: [QK] });
      if (onClose) onClose();
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to create cash account"),
  });
};

/* ── Update ─────────────────────────────────────────────────────────────── */
const updateCashAccount = async ({ id, ...payload }) => {
  const { data } = await api.patch(`/companycashaccount/update/${id}`, payload);
  return data;
};

export const useUpdateCashAccount = ({ onClose } = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateCashAccount,
    onSuccess: () => {
      toast.success("Cash account updated");
      queryClient.invalidateQueries({ queryKey: [QK] });
      if (onClose) onClose();
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to update cash account"),
  });
};

/* ── Delete ─────────────────────────────────────────────────────────────── */
const deleteCashAccount = async (id) => {
  const { data } = await api.delete(`/companycashaccount/delete/${id}`);
  return data;
};

export const useDeleteCashAccount = ({ onClose } = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCashAccount,
    onSuccess: () => {
      toast.success("Cash account deleted");
      queryClient.invalidateQueries({ queryKey: [QK] });
      if (onClose) onClose();
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to delete cash account"),
  });
};
