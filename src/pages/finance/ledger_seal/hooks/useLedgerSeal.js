import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { api } from "../../../../services/api";
import { toast } from "react-toastify";

const QK = "ledger-seal";

export const useLedgerSealStatus = () =>
  useQuery({
    queryKey: [QK, "status"],
    queryFn: async () => {
      const { data } = await api.get("/ledger-seal/status");
      return data?.data;
    },
    staleTime: 30_000,
  });

export const useLedgerSealList = (params = {}) =>
  useQuery({
    queryKey: [QK, "list", params],
    queryFn: async ({ queryKey }) => {
      const [, , p] = queryKey;
      const { data } = await api.get("/ledger-seal/list", { params: p });
      return { data: data?.data || [], totalPages: data?.totalPages || 1 };
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

export const useLedgerSealVerify = (params = {}) =>
  useQuery({
    queryKey: [QK, "verify", params],
    queryFn: async ({ queryKey }) => {
      const [, , p] = queryKey;
      const { data } = await api.get("/ledger-seal/verify", { params: p });
      return data?.data;
    },
    enabled: !!(params.from_date && params.to_date),
    staleTime: 30_000,
  });

export const useSealApproved = ({ onSuccess } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post("/ledger-seal/seal-approved").then((r) => r.data?.data),
    onSuccess: (data) => {
      toast.success(`Sealed ${data?.added ?? 0} JE(s). Last chain hash updated.`);
      qc.invalidateQueries({ queryKey: [QK] });
      if (onSuccess) onSuccess(data);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Seal failed"),
  });
};
