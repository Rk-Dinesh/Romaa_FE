import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { api } from "../../../../services/api";
import { toast } from "react-toastify";

const QK = "ewaybill";

export const useEWayBillList = (params = {}) =>
  useQuery({
    queryKey: [QK, "list", params],
    queryFn: async ({ queryKey }) => {
      const [, , p] = queryKey;
      const { data } = await api.get("/ewaybill/list", { params: p });
      return { data: data?.data || [], totalPages: data?.totalPages || 1, totalCount: data?.totalCount || 0 };
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

export const useEWayBillDetail = (id) =>
  useQuery({
    queryKey: [QK, "detail", id],
    queryFn: async () => {
      const { data } = await api.get(`/ewaybill/${id}`);
      return data?.data;
    },
    enabled: !!id,
    staleTime: 15_000,
  });

export const useGenerateEWayBill = ({ onSuccess } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => api.post("/ewaybill/generate", payload).then((r) => r.data?.data),
    onSuccess: (data) => {
      toast.success(`E-Way Bill generated: ${data?.ewb_no || ""}`);
      qc.invalidateQueries({ queryKey: [QK] });
      if (onSuccess) onSuccess(data);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to generate E-Way Bill"),
  });
};

export const useUpdatePartB = ({ onSuccess } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => api.post(`/ewaybill/${id}/part-b`, payload).then((r) => r.data?.data),
    onSuccess: () => {
      toast.success("Part B (vehicle) updated");
      qc.invalidateQueries({ queryKey: [QK] });
      if (onSuccess) onSuccess();
    },
    onError: (err) => toast.error(err.response?.data?.message || "Part B update failed"),
  });
};

export const useCancelEWayBill = ({ onSuccess } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }) => api.post(`/ewaybill/${id}/cancel`, { reason }).then((r) => r.data?.data),
    onSuccess: () => {
      toast.success("E-Way Bill cancelled");
      qc.invalidateQueries({ queryKey: [QK] });
      if (onSuccess) onSuccess();
    },
    onError: (err) => toast.error(err.response?.data?.message || "Cancellation failed"),
  });
};
