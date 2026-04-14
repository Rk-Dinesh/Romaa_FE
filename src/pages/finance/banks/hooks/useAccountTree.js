import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { api } from "../../../../services/api";
import { toast } from "react-toastify";

/* ── List Accounts ───────────────────────────────────────────────────────── */
const fetchAccounts = async ({ queryKey }) => {
  const [, params] = queryKey;
  const { data } = await api.get("/accounttree/list", {
    params: {
      page: params.page,
      limit: params.limit,
      search: params.search,
      fromdate: params.fromdate,
      todate: params.todate,
      parent_code: params.parent_code,
      is_posting_account: params.is_posting_account,
    },
  });
  return { data: data?.data || [], pagination: data?.pagination || {} };
};

export const useAccounts = (params = {}) =>
  useQuery({
    queryKey: ["accounttree-list", params],
    queryFn:  fetchAccounts,
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });

/* ── Hierarchical Tree ───────────────────────────────────────────────────── */
const fetchTree = async ({ queryKey }) => {
  const [, root] = queryKey;
  const params = root ? { root } : {};
  const { data } = await api.get("/accounttree/tree", { params });
  return data?.data || [];
};

export const useAccountTree = (root = null) =>
  useQuery({
    queryKey: ["accounttree-tree", root],
    queryFn:  fetchTree,
    staleTime: 60 * 1000,
  });

/* ── Search Accounts ─────────────────────────────────────────────────────── */
const fetchSearchAccounts = async ({ queryKey }) => {
  const [, q] = queryKey;
  const { data } = await api.get("/accounttree/search", { params: { q } });
  return data?.data || [];
};

export const useSearchAccounts = (q) =>
  useQuery({
    queryKey: ["accounttree-search", q],
    queryFn:  fetchSearchAccounts,
    enabled:  !!q && q.length >= 1,
    staleTime: 15 * 1000,
  });

/* ── Create Account ──────────────────────────────────────────────────────── */
const createAccountApi = async (payload) => {
  const { data } = await api.post("/accounttree/create", payload);
  return data;
};

export const useCreateAccount = ({ onSuccess, onClose } = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAccountApi,
    onSuccess: () => {
      toast.success("Account created successfully");
      queryClient.invalidateQueries({ queryKey: ["accounttree-list"] });
      queryClient.invalidateQueries({ queryKey: ["accounttree-tree"] });
      if (onSuccess) onSuccess();
      if (onClose)   onClose();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to create account");
    },
  });
};

/* ── Update Account ──────────────────────────────────────────────────────── */
const updateAccountApi = async ({ id, ...payload }) => {
  const { data } = await api.patch(`/accounttree/update/${id}`, payload);
  return data;
};

export const useUpdateAccount = ({ onSuccess, onClose } = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAccountApi,
    onSuccess: () => {
      toast.success("Account updated successfully");
      queryClient.invalidateQueries({ queryKey: ["accounttree-list"] });
      queryClient.invalidateQueries({ queryKey: ["accounttree-tree"] });
      if (onSuccess) onSuccess();
      if (onClose)   onClose();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update account");
    },
  });
};

/* ── Delete Account ──────────────────────────────────────────────────────── */
const deleteAccountApi = async (id) => {
  const { data } = await api.delete(`/accounttree/delete/${id}`);
  return data;
};

export const useDeleteAccount = ({ onSuccess } = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAccountApi,
    onSuccess: () => {
      toast.success("Account deleted");
      queryClient.invalidateQueries({ queryKey: ["accounttree-list"] });
      queryClient.invalidateQueries({ queryKey: ["accounttree-tree"] });
      if (onSuccess) onSuccess();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete account");
    },
  });
};

/* ── Seed Default COA ────────────────────────────────────────────────────── */
const seedCOAApi = async () => {
  const { data } = await api.post("/accounttree/seed");
  return data;
};

export const useSeedCOA = ({ onSuccess } = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: seedCOAApi,
    onSuccess: (res) => {
      const msg = res?.data?.message || "Seed complete";
      toast.success(msg);
      queryClient.invalidateQueries({ queryKey: ["accounttree-list"] });
      queryClient.invalidateQueries({ queryKey: ["accounttree-tree"] });
      if (onSuccess) onSuccess();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Seed failed");
    },
  });
};
