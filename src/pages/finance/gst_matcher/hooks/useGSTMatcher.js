import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { api } from "../../../../services/api";
import { toast } from "react-toastify";

const QK = "gst-matcher";

export const useGSTMatcherList = (params = {}) =>
  useQuery({
    queryKey: [QK, "list", params],
    queryFn: async ({ queryKey }) => {
      const [, , p] = queryKey;
      const { data } = await api.get("/gst-matcher/list", { params: p });
      return { data: data?.data || [], totalPages: data?.totalPages || 1 };
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

export const useGSTMatcherDetail = (id) =>
  useQuery({
    queryKey: [QK, "detail", id],
    queryFn: async () => {
      const { data } = await api.get(`/gst-matcher/${id}`);
      return data?.data;
    },
    enabled: !!id,
    staleTime: 15_000,
  });

export const useUploadGSTEntries = ({ onSuccess } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => api.post("/gst-matcher/upload", payload).then((r) => r.data?.data),
    onSuccess: (data) => {
      toast.success(`Uploaded ${data?.summary?.entry_count || 0} entries`);
      qc.invalidateQueries({ queryKey: [QK] });
      if (onSuccess) onSuccess(data);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Upload failed"),
  });
};

export const useRunGSTMatch = ({ onSuccess } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => api.post("/gst-matcher/match", payload).then((r) => r.data?.data),
    onSuccess: (data) => {
      toast.success(`Match complete — ${data?.matched || 0} matched, ${data?.ambiguous || 0} ambiguous`);
      qc.invalidateQueries({ queryKey: [QK] });
      if (onSuccess) onSuccess(data);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Match run failed"),
  });
};

export const useLinkGSTEntry = ({ onSuccess } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, entry_index, bill_id }) => api.post(`/gst-matcher/${id}/link`, { entry_index, bill_id }).then((r) => r.data),
    onSuccess: (_, { id }) => {
      toast.success("Entry linked to bill");
      qc.invalidateQueries({ queryKey: [QK, "detail", id] });
      qc.invalidateQueries({ queryKey: [QK] });
      if (onSuccess) onSuccess();
    },
    onError: (err) => toast.error(err.response?.data?.message || "Link failed"),
  });
};

export const useUnlinkGSTEntry = ({ onSuccess } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, entry_index }) => api.post(`/gst-matcher/${id}/unlink`, { entry_index }).then((r) => r.data),
    onSuccess: (_, { id }) => {
      toast.success("Entry unlinked");
      qc.invalidateQueries({ queryKey: [QK, "detail", id] });
      qc.invalidateQueries({ queryKey: [QK] });
      if (onSuccess) onSuccess();
    },
    onError: (err) => toast.error(err.response?.data?.message || "Unlink failed"),
  });
};

export const useDeleteGSTUpload = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/gst-matcher/${id}`).then((r) => r.data),
    onSuccess: () => {
      toast.success("Upload deleted");
      qc.invalidateQueries({ queryKey: [QK] });
    },
    onError: (err) => toast.error(err.response?.data?.message || "Delete failed"),
  });
};
