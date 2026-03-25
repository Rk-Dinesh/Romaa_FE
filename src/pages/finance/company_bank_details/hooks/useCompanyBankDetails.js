import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../../services/api";
import { toast } from "react-toastify";

const QK = "company-bank-accounts";

/* ── List ────────────────────────────────────────────────────────────────── */
const fetchBankAccounts = async () => {
  const { data } = await api.get("/companybankaccount/list");
  return data?.data || [];
};

export const useCompanyBankDetails = () =>
  useQuery({
    queryKey: [QK],
    queryFn: fetchBankAccounts,
    staleTime: 30 * 1000,
  });

/* ── Create ─────────────────────────────────────────────────────────────── */
const createBankAccount = async (payload) => {
  const { data } = await api.post("/companybankaccount/create", payload);
  return data;
};

export const useCreateBankDetail = ({ onClose } = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBankAccount,
    onSuccess: () => {
      toast.success("Bank account created");
      queryClient.invalidateQueries({ queryKey: [QK] });
      if (onClose) onClose();
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to create bank account"),
  });
};

/* ── Update ─────────────────────────────────────────────────────────────── */
const updateBankAccount = async ({ id, ...payload }) => {
  const { data } = await api.patch(`/companybankaccount/update/${id}`, payload);
  return data;
};

export const useUpdateBankDetail = ({ onClose } = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateBankAccount,
    onSuccess: () => {
      toast.success("Bank account updated");
      queryClient.invalidateQueries({ queryKey: [QK] });
      if (onClose) onClose();
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to update bank account"),
  });
};

/* ── Delete ─────────────────────────────────────────────────────────────── */
const deleteBankAccount = async (id) => {
  const { data } = await api.delete(`/companybankaccount/delete/${id}`);
  return data;
};

export const useDeleteBankDetail = ({ onClose } = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteBankAccount,
    onSuccess: () => {
      toast.success("Bank account deleted");
      queryClient.invalidateQueries({ queryKey: [QK] });
      if (onClose) onClose();
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to delete bank account"),
  });
};
