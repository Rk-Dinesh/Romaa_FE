import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../../services/api";
import { toast } from "react-toastify";

/* ── Tender IDs ─────────────────────────────────────────────────────────── */
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

/* ── Vendors for a tender ───────────────────────────────────────────────── */
const fetchVendors = async ({ queryKey }) => {
  const [, tenderId] = queryKey;
  const { data } = await api.get(`/permittedvendor/getvendor/${tenderId}`);
  return data?.permitted_vendors ?? data?.data?.permitted_vendors ?? [];
};

export const useVendors = (tenderId) =>
  useQuery({
    queryKey: ["permitted-vendors", tenderId],
    queryFn:  fetchVendors,
    enabled:  !!tenderId,
  });

/* ── Contractors for a tender ───────────────────────────────────────────── */
const fetchContractors = async ({ queryKey }) => {
  const [, tenderId] = queryKey;
  const { data } = await api.get(`/contractor/getbytender/${tenderId}`);
  return data?.contractors ?? data?.data ?? [];
};

export const useContractors = (tenderId) =>
  useQuery({
    queryKey: ["contractors", tenderId],
    queryFn:  fetchContractors,
    enabled:  !!tenderId,
  });

/* ── Next CN number ─────────────────────────────────────────────────────── */
const fetchNextCNNo = async () => {
  const { data } = await api.get("/creditnote/next-no");
  return data?.cn_no || "";
};

export const useNextCNNo = () =>
  useQuery({
    queryKey: ["next-cn-no"],
    queryFn:  fetchNextCNNo,
    staleTime: 0,
    refetchOnMount: true,
  });

/* ── Next DN number ─────────────────────────────────────────────────────── */
const fetchNextDNNo = async () => {
  const { data } = await api.get("/debitnote/next-no");
  return data?.dn_no || "";
};

export const useNextDNNo = () =>
  useQuery({
    queryKey: ["next-dn-no"],
    queryFn:  fetchNextDNNo,
    staleTime: 0,
    refetchOnMount: true,
  });

/* ── Create Credit Note ─────────────────────────────────────────────────── */
const createCNApi = async (payload) => {
  const { data } = await api.post("/creditnote/create", payload);
  return data;
};

export const useCreateCN = ({ onSuccess, onClose } = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCNApi,
    onSuccess: () => {
      toast.success("Credit note created successfully");
      queryClient.invalidateQueries({ queryKey: ["credit-notes"] });
      queryClient.invalidateQueries({ queryKey: ["next-cn-no"] });
      if (onSuccess) onSuccess();
      if (onClose)   onClose();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to create credit note");
    },
  });
};

/* ── Create Debit Note ──────────────────────────────────────────────────── */
const createDNApi = async (payload) => {
  const { data } = await api.post("/debitnote/create", payload);
  return data;
};

export const useCreateDN = ({ onSuccess, onClose } = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createDNApi,
    onSuccess: () => {
      toast.success("Debit note created successfully");
      queryClient.invalidateQueries({ queryKey: ["debit-notes"] });
      queryClient.invalidateQueries({ queryKey: ["next-dn-no"] });
      if (onSuccess) onSuccess();
      if (onClose)   onClose();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to create debit note");
    },
  });
};

/* ── Approve Credit Note ────────────────────────────────────────────────── */
export const useApproveCN = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.patch(`/creditnote/approve/${id}`).then((r) => r.data),
    onSuccess: () => {
      toast.success("Credit note approved");
      queryClient.invalidateQueries({ queryKey: ["credit-notes"] });
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to approve credit note"),
  });
};

/* ── Approve Debit Note ─────────────────────────────────────────────────── */
export const useApproveDN = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.patch(`/debitnote/approve/${id}`).then((r) => r.data),
    onSuccess: () => {
      toast.success("Debit note approved");
      queryClient.invalidateQueries({ queryKey: ["debit-notes"] });
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to approve debit note"),
  });
};

/* ── List Credit Notes ──────────────────────────────────────────────────── */
const fetchCNList = async ({ queryKey }) => {
  const [, params] = queryKey;
  const { data } = await api.get("/creditnote/list", { params });
  return data?.data || [];
};

export const useCNList = (params = {}) =>
  useQuery({
    queryKey: ["credit-notes", params],
    queryFn:  fetchCNList,
    staleTime: 30 * 1000,
  });

/* ── List Debit Notes ───────────────────────────────────────────────────── */
const fetchDNList = async ({ queryKey }) => {
  const [, params] = queryKey;
  const { data } = await api.get("/debitnote/list", { params });
  return data?.data || [];
};

export const useDNList = (params = {}) =>
  useQuery({
    queryKey: ["debit-notes", params],
    queryFn:  fetchDNList,
    staleTime: 30 * 1000,
  });
